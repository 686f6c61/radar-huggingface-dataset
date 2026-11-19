# ggml-org-dev/tiny-lev-for-testing

## Resumen

tiny-lev-for-testing es un adaptador LoRA de tipo PEFT publicado por la organización ggml-org-dev, derivado de forma deliberadamente degradada del adaptador original interfaze-ai/lev. Su propósito no es el uso productivo, sino servir como artefacto de pruebas para el software llama.cpp: reproduce el mismo diseño de calibración, prompt de lectura de etiquetas (plantilla de chat) y disposición LoRA que el modelo real, de modo que el código de conversión y fusión de llama.cpp (tipo de decisión `lev`) se ejecuta por las mismas rutas sin necesidad de descargar ni procesar el modelo completo.

El adaptador se monta sobre una copia reducida del modelo base Qwen3.5-4B, denominada ggml-org-dev/tiny-Qwen3.5-4B-for-testing. El autor advierte explícitamente de que se trata de una copia modificada y dañada cuyas salidas son incoherentes (gibberish) y que no debe utilizarse para ningún otro fin. La ficha, por tanto, describe un artefacto de CI, no un modelo apto para inferencia real.

La relevancia es estrictamente de ingeniería: permite validar en integración continua el pipeline de conversión a GGUF, la fusión del adaptador y el manejo del prompt de calibración en llama.cpp con un repositorio de tamaño despreciable (0,0 GB) y bajo licencia Apache 2.0, la misma que el modelo base Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Qwen3.5 reducido; no se detalla la arquitectura interna del base |
| Parametros totales | no disponible (adaptador LoRA sobre modelo base reducido; el repo ocupa 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe una versión GGUF publicada por el autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería peft); versión GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango 32 y alpha conservados, obtenido recortando (slicing) el adaptador original interfaze-ai/lev mediante el script `slice_qwen35_lora.py`, que sigue la skill `slice-model` de llama.cpp. El recorte afecta a 4 de las 32 capas del adaptador original (capas 0, 1, 2 y 3), cuyos tensores A y B se estrechan con los mismos índices que el modelo base: A conserva las columnas de entrada de su peso base y B las filas de salida. Además, `mode_b_head.pt` (la cabeza para conjuntos grandes de opciones, no usada por llama.cpp) ve reducidas sus proyecciones de entrada al tamaño oculto de 32. El campo `base_model_name_or_path` apunta a ggml-org-dev/tiny-Qwen3.5-4B-for-testing.

No se documenta ningún proceso de entrenamiento: no hay datos sobre tokens, composición del dataset ni etapas de RLHF o DPO. El adaptador hereda la estructura del original (calibración, prompt de lectura de etiquetas y disposición LoRA) pero con pesos degradados, y el autor indica que las imágenes de ejemplo (`assets/`) no se incluyen. La innovación relevante es de tooling, no de modelado: al mantener el mismo layout que el adaptador real, permite que el conversor de llama.cpp descargue el modelo base indicado en `adapter_config.json` y fusione el adaptador ejecutando exactamente las mismas rutas de código que con lev, pero con un coste mínimo apto para CI.

## Capacidades

- No ofrece capacidades de generación útiles: el autor declara que su salida es incoherente (gibberish).
- Reproduce el formato de prompt de lectura de etiquetas (chat template) del adaptador lev, útil para probar el parseo de prompts.
- Conserva la disposición LoRA (rango 32, alpha) y la estructura de calibración del original, lo que permite validar la fusión de adaptadores.
- Sirve para ejercitar el tipo de decisión `lev` en llama.cpp, incluida la descarga automática del modelo base y la fusión del adaptador.
- No se documentan soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Integración continua de llama.cpp: ejecutar en cada commit las pruebas del pipeline de conversión y fusión del tipo `lev` sin descargar el modelo real, gracias al tamaño mínimo del repositorio.
- Pruebas de regresión del conversor GGUF: validar que la descarga del base indicado en `adapter_config.json` y la fusión del adaptador producen los artefactos esperados.
- Validación del parseo de chat template: comprobar que el prompt de lectura de etiquetas del adaptador se renderiza y consume correctamente en las herramientas de llama.cpp.
- Pruebas de la lógica de slicing: verificar que el recorte de tensores A y B por capas y el ajuste de `mode_b_head.pt` al tamaño oculto 32 se comportan según lo esperado.
- Pruebas de empaquetado y distribución: usar el repo como fixture ligero para validar flujos de descarga, caché y resolución de repositorios en entornos de CI.
- Pruebas de compatibilidad GGUF: comparar el comportamiento del adaptador en safetensors y en su versión GGUF (tiny-lev-for-testing-GGUF) dentro de las mismas suites de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un artefacto de pruebas con salidas incoherentes, no procede estimación de producción.
- GPU recomendadas: no disponibles; el diseño está pensado para ejecutarse en CI, sin requisitos de GPU documentados.
- Cabe en GPU consumer: no disponible; el tamaño reducido del base y del adaptador sugiere que sí, pero no se documenta.
- Opciones de despliegue: llama.cpp (tipo de decisión `lev`, con descarga y fusión automática del base) y su versión GGUF; PEFT para carga del adaptador en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-lev-for-testing | LoRA sobre base reducido | no disponible | no disponible | apache-2.0 | Pruebas de software (CI) |
| interfaze-ai/lev | LoRA sobre Qwen3.5-4B | no disponible | no disponible | apache-2.0 | Adaptador funcional original |
| ggml-org-dev/tiny-Qwen3.5-4B-for-testing | Modelo base reducido | no disponible | no disponible | no disponible | Base de pruebas para CI |

## Limitaciones y advertencias

- El autor advierte de que es una copia modificada y dañada: su salida es incoherente y no debe usarse para ningún fin distinto de las pruebas de software.
- No es apto para producción, investigación ni evaluación de calidad; cualquier métrica obtenida con él no es representativa del adaptador original lev.
- Solo se conservan 4 de las 32 capas del adaptador original, por lo que el comportamiento dista del modelo real.
- No se documentan sesgos, riesgo de alucinación ni cobertura idiomática; al ser un artefacto de test, no procede evaluarlos.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza degradada lo hace inútil para ello; el uso comercial del modelo base Qwen3.5-4B se rige por su propia licencia.
- No se incluyen las imágenes de ejemplo (`assets/`) del repositorio original.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-lev-for-testing
- Versión GGUF: https://huggingface.co/ggml-org-dev/tiny-lev-for-testing-GGUF
- Modelo base de pruebas: https://huggingface.co/ggml-org-dev/tiny-Qwen3.5-4B-for-testing
- Adaptador original: https://huggingface.co/interfaze-ai/lev
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Script de recorte: slice_qwen35_lora.py (incluido en el repositorio)
