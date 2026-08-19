# GoodStartLabs/latent-graft-chess-go-qwen3-1.7b

## Resumen

`GoodStartLabs/latent-graft-chess-go-qwen3-1.7b` es un artefacto de investigación del proyecto *Latent Grafting* de Good Start Labs. Se trata de un modelo experimental que combina un LLM base, Qwen3-1.7B, con un "injerto latente" (latent graft): un pequeño proyector entrenado (stem) que comprime las representaciones internas de motores de ajedrez y Go (Leela/BT4 y KataGo) en `k` tokens blandos continuos, que se insertan en el flujo de entrada del LLM. El LLM, congelado, se adapta mediante LoRA para consumir estos tokens y jugar ambas disciplinas.

El modelo resuelve un problema de investigación: cómo hacer que un LLM general realice búsqueda y razonamiento sobre representaciones latentes de dominios específicos sin ver el tablero ni las políticas de los motores. Su relevancia actual radica en que demuestra que **descongelar parcialmente el LLM (LoRA) durante el injerto desbloquea la capacidad de juego**, superando la brecha entre la capacidad de clasificar movimientos y la de jugar partidas completas. El checkpoint corresponde al paso 1000 de entrenamiento, con un coeficiente de empalme α = −0.564.

No es un modelo de chat ni un modelo autónomo: requiere el código del proyecto (stem, `SearchPlayer`) y los motores de juego congelados para funcionar. El repositorio contiene dos partes: `joint_best.pt` (40 MB, proyector compartido + adaptadores por juego) y `lora_best/` (279 MB, pesos LoRA del LLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-1.7B) + LoRA + stem/proyector de tokens blandos |
| Parametros totales | No disponible (base: 1.7B; LoRA y stem no cuantificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-1.7B, no especificada) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; solo safetensors para LoRA) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LoRA) y .pt (stem/proyector) |

## Arquitectura y entrenamiento

La arquitectura combina un LLM base Qwen3-1.7B (transformador causal) con un **stem** entrenado que proyecta las features internas de un motor de ajedrez (Leela/BT4) o Go (KataGo) en `k` tokens blandos continuos. Estos tokens se empalman en el prompt del LLM mediante una operación de mezcla con ganancia aprendida: `soft = null + α · rms_rescale(stem_out)`, donde α = −0.564 es un coeficiente aprendido (el signo negativo es una convención, no una inversión). El LLM permanece congelado en su tronco, pero se adapta con una capa LoRA (`lora_best/`) para aprender a interpretar los tokens injertados.

El entrenamiento se realizó en dos etapas. La primera (Stage-1) optimizó el stem y los adaptadores por juego para minimizar la divergencia KL entre las predicciones del modelo y los movimientos de los motores, logrando gaps de acuerdo top-1 de 0.789 (ajedrez) y 0.508 (Go). La segunda etapa (Stage-2) descongeló el LLM vía LoRA, lo que desbloqueó la capacidad de jugar partidas completas. El resultado es una ganancia de fuerza estimada entre +250 y +440 Elo sobre configuraciones con prefijo congelado, y una lectura por nodo con precisión ≈0.74 frente a 0.14 aleatorio en posiciones decisivas.

## Capacidades

- Juego de ajedrez y Go mediante lectura de representaciones latentes de motores externos (no ve el tablero ni las políticas).
- Lectura de valor por nodo con matriz de confusión tri-diagonal (ordenada por valor) en posiciones decisivas, con precisión de lectura ≈0.74 (vs 0.14 aleatorio).
- Soporte de múltiples juegos con un solo proyector compartido y adaptadores específicos por juego (`chess`, `go`).
- Capacidad de servir como punto de partida (warm-start) para experimentos de búsqueda en Stage-2.
- No es un modelo de chat: no genera texto libre ni responde a instrucciones generales.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del contexto de juego.
- No tiene capacidades multilingües ni de visión; los tokens blandos son irreductiblemente continuos y no inspeccionables como texto.

## Casos de uso

- **Investigación reproducible en latent grafting**: el checkpoint permite reproducir los resultados del proyecto y comparar metodologías de injerto de representaciones continuas en LLMs. Se usa cargando el stem y la LoRA con el código del proyecto.
- **Estudio de interpretabilidad de representaciones**: al leer el valor latente por nodo con alta precisión, sirve para investigar cómo un LLM internaliza señales continuas externas y las convierte en decisiones de juego.
- **Warm-start para experimentos de búsqueda en Stage-2**: el modelo es el punto de partida para entrenar sistemas de búsqueda que combinan el LLM con el motor de juego, reduciendo el tiempo de convergencia.
- **Benchmark de técnicas de adaptación de LLM**: permite comparar el efecto de descongelar parcialmente el LLM (LoRA) frente a mantenerlo congelado, aislando la contribución de la co-adaptación.
- **Desarrollo de métodos de fusión de modelos**: sirve como caso de estudio para arquitecturas híbridas que integran motores simbólicos con LLMs mediante tokens blandos, aplicable a otros dominios (robótica, control, etc.).
- **Evaluación de la brecha gap vs. fuerza**: el modelo ejemplifica cómo una métrica de clasificación (gap KL) no predice la capacidad de juego, y cómo la co-adaptación resuelve esa discrepancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La evaluación se limita a métricas específicas del proyecto, recogidas en la model card:

| Metrica | Valor |
|---|---|
| Gap de acuerdo top-1 (Stage-1, ajedrez) | 0.789 |
| Gap de acuerdo top-1 (Stage-1, Go) | 0.508 |
| Ganancia de fuerza (Elo) sobre prefijo congelado | +250 a +440 |
| Precision de lectura por nodo (posiciones decisivas) | ≈0.74 (vs 0.14 aleatorio) |

Estas cifras son internas del proyecto y no comparables con benchmarks de NLP generales.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen3-1.7B en bfloat16 ocupa aproximadamente 3.5 GB; la LoRA (~279 MB) y el stem (~40 MB) añaden menos de 0.5 GB. Total estimado < 4.5 GB en inferencia.
- **GPU recomendadas**: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4070, etc.) es suficiente para el LLM. Sin embargo, el pipeline completo requiere ejecutar el motor de juego (Leela/BT4 o KataGo), que puede demandar CPU/GPU adicional según la configuración.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media.
- **Opciones de despliegue**: no es compatible con vLLM, llama.cpp, Ollama ni TGI estándar, porque necesita el código personalizado del proyecto (`Stem`, `SharedProjector`, `SearchPlayer`) y los motores de juego congelados. El despliegue se hace mediante scripts Python del repositorio de Good Start Labs.
- **Latencia y throughput**: no disponibles. Dependen del motor de juego externo y del número de tokens blandos `k` (no especificado).

## Comparativa con modelos similares

No hay modelos públicos comparables en la misma categoría (latent grafting de juegos). Se puede comparar con el baseline sin injerto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | No especificado | No juega ajedrez/Go | Apache-2.0 |
| latent-graft-chess-go-qwen3-1.7b (este) | 1.7B + LoRA + stem | No especificado | Juega ajedrez y Go con +250 a +440 Elo sobre prefijo congelado | Apache-2.0 |
| sf-cot-dagger-chess-qwen3-1.7b (relacionado) | 1.7B + LoRA | No especificado | Baseline de ajedrez con CoT (sin injerto) | Apache-2.0 |

No se dispone de datos de rendimiento del modelo relacionado para comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere el código del proyecto y los motores de juego congelados (Leela/BT4, KataGo) para generar las features que el stem comprime. El LLM solo no puede jugar.
- **Artefacto de investigación**: no es un asistente general ni un modelo de chat; no responde a instrucciones arbitrarias.
- **Tokens blandos irreductiblemente continuos**: no pueden discretizarse a tokens del vocabulario sin destruir la señal, por lo que el injerto no es inspeccionable como texto.
- **Evaluación limitada**: solo se ha evaluado en ajedrez y Go con métricas internas; no hay pruebas de generalización a otros dominios.
- **Riesgo de alucinación**: no aplicable en el sentido clásico, pero el modelo puede producir movimientos inválidos si el stem no recibe features correctas del motor.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el código y los motores de juego asociados pueden tener licencias propias (no especificadas).
- **Dependencia de infraestructura externa**: el rendimiento depende de la calidad del motor de juego y de la sincronización entre el trunk congelado y el stem.

## Enlaces

- [HuggingFace: GoodStartLabs/latent-graft-chess-go-qwen3-1.7b](https://huggingface.co/GoodStartLabs/latent-graft-chess-go-qwen3-1.7b)
- [Sitio web de Good Start Labs](https://goodstartlabs.com/)
- [GitHub de Good Start Labs](https://github.com/GoodStartLabs)
- [Modelo base: Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Artefacto relacionado: sf-cot-dagger-chess-qwen3-1.7b](https://huggingface.co/GoodStartLabs/sf-cot-dagger-chess-qwen3-1.7b)
