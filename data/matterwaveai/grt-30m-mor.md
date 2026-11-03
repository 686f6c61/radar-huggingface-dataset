# MatterWaveAI/grt-30m-mor

## Resumen

GRT-30M-MoR es un modelo de generación de texto de pequeño tamaño (32,17 millones de parámetros según los pesos en safetensors; la model card declara 31.634.086) desarrollado por MatterWaveAI. Se trata de la variante "upcycled" con Mixture-of-Rotations (MoR) del modelo base MatterWaveAI/grt-30m, y su rasgo más distintivo es que no contiene ninguna capa `nn.Linear`: toda la transformación se realiza mediante rotaciones de Givens 2D organizadas en cascadas.

El modelo explora una arquitectura experimental denominada Givens Rotational Transformer (GRT), en la que las matrices densas se sustituyen por productos de rotaciones parametrizadas. La variante MoR añade cuatro "expertos" rotacionales por bloque de feed-forward, combinados por un router que opera con alineación de fase angular sobre un toro (S^1)^128. El autor reporta una mejora drástica de perplejidad en held-out tras el upcycling, de 346,10 a 1,67.

Por su tamaño y su carácter experimental, es un modelo relevante para investigación sobre arquitecturas alternativas al transformer denso, no para despliegues de producción generalistas. No hay información publicada sobre idiomas soportados, datos de entrenamiento ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Givens Rotational Transformer (GRT) con Mixture-of-Rotations (MoR); sin capas `nn.Linear` |
| Parametros totales | 32.173.173 (safetensors); 31.634.086 según model card |
| Parametros activos | 4 expertos rotacionales por bloque FFN (no se especifica el reparto exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el quickstart usa float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GRT en la que cada uno de los 12 bloques `GRTFeedForward` mantiene `ffn_n_experts = 4` cascadas rotacionales, con tensores `expert_expand_angles [4, 21, 512]`, `expert_expand_scales [4, 21, 1024]`, `expert_contract_angles [4, 21, 512]` y `expert_contract_scales [4, 21, 1024]`. La clave del diseño es que las rotaciones de Givens 2D forman un grupo de Lie abeliano SO(2)^P por etapa, lo que permite al router mezclar los ángulos y escalas de los expertos antes de ejecutar una única rotación por par, logrando así una capacidad de 4 expertos con el coste computacional de una sola rotación.

El router (`GRTRotationalRouter`) no usa capas lineales: asigna tokens a expertos mediante alineación de fase coseno contra E=4 prototipos de fase aprendidos sobre el toro (S^1)^128. El proceso de upcycling parte del modelo base grt-30m (29.305.498 parámetros) y especializa los cuatro expertos. El autor reporta perplejidad en held-out de 346,10 en el upcycling inicial zero-sum y 1,67 tras la especialización, con pérdida de 5,8467 a 0,5115. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva mediante `transformers` (`AutoModelForCausalLM`).
- Razonamiento y generación de código: no hay evidencia publicada de rendimiento específico en estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Rasgo arquitectónico destacable: routing rotacional sin capas lineales, útil como banco de pruebas para investigación.

## Casos de uso

- Investigación en arquitecturas alternativas: sirve para estudiar si las rotaciones de Givens pueden sustituir a las matrices densas en transformers de pequeño tamaño, comparando perplejidad y estabilidad de entrenamiento frente a baselines densos.
- Experimentos de upcycling de expertos: el modelo documenta un proceso de conversión de un modelo denso a una variante MoR con cuatro expertos, útil como referencia metodológica para replicar la técnica en otros modelos.
- Prototipado educativo: con 32 millones de parámetros y licencia Apache 2.0, es adecuado para demostraciones docentes sobre routing, grupos de Lie y atención.
- Pruebas de integración con `transformers`: al cargarse con `AutoModelForCausalLM` y `AutoTokenizer`, permite validar pipelines de inferencia y herramientas de serialización en entornos de I+D.
- Benchmarking de eficiencia computacional: comparar el coste de una rotación única frente a cuatro expertos rotacionales en hardware consumer.
- Generación de texto de dominio acotado: solo si se valida previamente la calidad en el dominio concreto, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados por el autor son métricas internas de entrenamiento:

| Metrica | Valor inicial (upcycle zero-sum) | Valor tras especializacion |
|---|---|---|
| Perplejidad held-out | 346,10 | 1,67 |
| Loss held-out | 5,8467 | 0,5115 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (32 millones de parámetros); aproximadamente 0,1 GB en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también CPU.
- Cabe holgadamente en GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` con PyTorch (soporte nativo); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura GRT es personalizada y requiere código específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-30M-MoR | 32,17 M | no disponible | GRT + MoR | Apache 2.0 | HuggingFace |
| MatterWaveAI/grt-30m (base) | 29,31 M | no disponible | GRT denso | Apache 2.0 | HuggingFace |
| Modelos densos de ~30M (p. ej. variantes TinyLlama/SmolLM de escala similar) | ~30 M | variable | Transformer denso | variable | HuggingFace |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma escala.

## Limitaciones y advertencias

- Modelo experimental de investigación: no hay evidencia de calidad en tareas reales más allá de las métricas internas del autor.
- Riesgo elevado de alucinación y de generación incoherente, dado el tamaño reducido y la falta de benchmarks.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano.
- Longitud de contexto no especificada; no apto para tareas que requieran ventanas largas sin validación previa.
- La arquitectura GRT no está soportada por herramientas estándar de inferencia (vLLM, llama.cpp, Ollama); requiere código personalizado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación técnica desaconseja su uso en producción.
- El proceso de upcycling y los datos de entrenamiento no están documentados, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
