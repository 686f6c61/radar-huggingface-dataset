# huggingface-mic/vip-llava-7b-hf-mic

## Resumen

`huggingface-mic/vip-llava-7b-hf-mic` es un artefacto de prueba (fixture) publicado en Hugging Face por la organización `huggingface-mic`. No es un modelo entrenado ni utilizable en producción: se trata de una versión "adelgazada" del checkpoint `llava-hf/vip-llava-7b-hf`, con la misma arquitectura (`VipLlavaForConditionalGeneration`) pero con un número de capas drásticamente reducido (2 capas en el codificador visual y 2 en el decodificador de texto) y pesos aleatorios generados con semilla 17. Su propósito es servir como fixture de integración para el proyecto `transformers-mic`, permitiendo validar contratos de uso y expectativas de framework sin descargar el modelo real de 7B parámetros.

El modelo base, Vip-LlaVa, es una variante de LLaVA que mejora el protocolo de entrenamiento marcando imágenes e interactuando con el modelo mediante señales visuales naturales como "recuadro rojo" o "flecha señaladora" durante el entrenamiento. Está construido sobre un transformer autorregresivo con un codificador visual y un proyector multimodal que conecta la visión con el espacio de embeddings del lenguaje.

Este repositorio concreto no debe confundirse con el modelo funcional: contiene únicamente 4.336.704 parámetros (frente a los aproximadamente 7.000 millones del original), pesos en float16 sin entrenar y ficheros de procesador copiados byte a byte del checkpoint base. Es relevante exclusivamente para desarrolladores que trabajen en el pipeline de integración de `transformers-mic` y necesiten un artefacto ligero y determinista para tests.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VipLlavaForConditionalGeneration (transformer multimodal vision-language) |
| Parametros totales | 4.336.704 (fixture adelgazado; el modelo base tiene ~7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `VipLlavaForConditionalGeneration` del modelo base `llava-hf/vip-llava-7b-hf`, pero con una configuración reducida: 2 capas ocultas en el componente visual y 2 capas ocultas en el componente de texto, según la regla genérica de adelgazamiento aplicada por `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture es intercambiable a nivel de carga de pesos.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato debía mover los logits al menos 0.001. La perturbación más débil (`pixel_values:halve`) produjo un desplazamiento de 0.0363, superando el umbral, por lo que no fue necesario entrenar. Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `preprocessor_config.json`, `chat_template.json`, `special_tokens_map.json`, `added_tokens.json`, `generation_config.json`, `processor_config.json`, `tokenizer_config.json`) se copiaron byte a byte desde `llava-hf/vip-llava-7b-hf`. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no genera texto ni responde a prompts de forma útil, ya que sus pesos son aleatorios.
- Reproduce la interfaz de `VipLlavaForConditionalGeneration`, incluyendo la firma de entradas multimodales (texto e imágenes) del modelo base.
- Sirve para validar la carga de checkpoints, la inspección de nombres de tensores y la compatibilidad de procesadores.
- Permite ejecutar tests de forward, loss y gradientes en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, razonamiento multilingüe ni capacidades especiales reales, al carecer de entrenamiento.
- El modelo base Vip-LlaVa sí incorpora interacción mediante señales visuales naturales (recuadros, flechas), pero esa capacidad no está presente en este fixture.

## Casos de uso

- Test de integración en CI: usar el fixture para verificar que el pipeline de `transformers-mic` carga correctamente un checkpoint `VipLlavaForConditionalGeneration` sin descargar los ~14 GB del modelo real.
- Validación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen contra un checkpoint con la misma estructura de tensores.
- Desarrollo de utilidades de inspección: probar herramientas que enumeran capas, formas de tensores y dtypes sobre un modelo ligero y determinista.
- Reproducción de fallos: al ser un artefacto pequeño y de pesos fijos (semilla 17), permite reproducir bugs de carga o de forward de forma consistente.
- Pruebas de sensibilidad de entradas: verificar que perturbaciones en `pixel_values` o `input_ids` producen cambios medibles en los logits, como parte del gate de calidad del fixture.
- Formación de nuevos contribuidores: servir como ejemplo didáctico de cómo se construye un fixture adelgazado con `build_fixtures.py` y cómo se documenta su procedencia en `build.json`.
- Validación de procesadores: comprobar que los ficheros de tokenizer y preprocessor copiados del modelo base se cargan sin errores en el entorno de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento medible en tareas de visión-lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el checkpoint ocupa 0.0 GB en el repositorio y tiene 4.336.704 parámetros en float16 (aproximadamente 8,7 MB de pesos).
- GPU recomendadas: cualquier GPU con soporte de float16, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; también es viable en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: carga mediante `transformers` con `VipLlavaForConditionalGeneration`; no está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo funcional.
- Latencia y throughput: no disponibles; al ser un fixture, las mediciones no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/vip-llava-7b-hf-mic` | 4,3M (fixture) | no disponible | no disponible | Fixture de test |
| `llava-hf/vip-llava-7b-hf` | ~7B | no disponible | no disponible | Modelo vision-language funcional |
| `llava-hf/llava-1.5-7b-hf` | ~7B | no disponible | no disponible | Modelo vision-language funcional |

La comparación relevante es únicamente estructural: el fixture comparte arquitectura y nombres de tensores con `llava-hf/vip-llava-7b-hf`, pero carece de pesos entrenados y de capacidad de inferencia útil. Frente a otros modelos LLaVA de 7B, la diferencia es de tres órdenes de magnitud en parámetros y de propósito (test versus uso real).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- No dispone de licencia declarada, lo que impide determinar condiciones de uso comercial.
- No se han documentado idiomas soportados ni sesgos, al no haber entrenamiento.
- Riesgo de confusión: un usuario podría descargarlo pensando que es Vip-LlaVa 7B; el tamaño del repositorio (0.0 GB) y el número de parámetros (4,3M) lo delatan.
- No apto para producción, demos públicas ni evaluación de calidad.
- La ventana de contexto no está disponible y, en cualquier caso, no sería representativa del modelo base.
- Cualquier métrica de rendimiento obtenida con este fixture no es extrapolable al checkpoint real.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/vip-llava-7b-hf-mic
- Modelo base: https://huggingface.co/llava-hf/vip-llava-7b-hf
- README del modelo base: https://huggingface.co/llava-hf/vip-llava-7b-hf/blob/main/README.md
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de adelgazamiento `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vip-llava-7b-hf-mic.html
