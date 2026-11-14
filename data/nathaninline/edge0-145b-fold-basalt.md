# nathaninline/Edge0-145B-fold-Basalt

## Resumen

Edge0-145B-fold-Basalt es una conversión no oficial del modelo Edge0/Edge0-145B-q3k a un único fichero `.basalt`, el formato que consume el motor de inferencia Basalt. El autor, nathaninline, no está afiliado a Edge0, Qwen ni a los desarrolladores de Basalt, y lo publica como experimento técnico para demostrar que la conversión de formato es viable y permitir medirla. El modelo original es un MoE latente de 145B parámetros construido sobre la arquitectura Qwen3.8-Flash-Next, con 48 capas y 512 expertos por capa.

El interés de esta ficha es doble. Por un lado, documenta una técnica de plegado de expertos MoE latentes (width 1792, proyecciones compartidas D y U) a la forma clásica de Flash-Next (2560 → 640 → 2560), que es exactamente reversible porque las proyecciones son lineales. Por otro, sirve de advertencia: el propio autor indica que la calidad es claramente inferior al original, porque sobre la cuantización Q3_K de partida se aplica una segunda cuantización agresiva (IQ2_XXS/IQ2_S en gate/up, IQ4_NL/Q2_0 en down) para que el fichero quepa en una GPU de 16 GB con 46 GB de RAM.

El resultado es un artefacto de investigación reproducible, con hash SHA-256 publicado, scripts en `tools/` y mediciones de perplejidad y throughput en hardware consumer. No es un modelo para producción: es una prueba de concepto de interoperabilidad entre motores y un caso de estudio sobre el coste en calidad de la recuantización encadenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE latente basada en Qwen3.8-Flash-Next (transformer con 48 capas, 512 expertos por capa, 8 grupos de expertos por capa); plegada a forma Flash-Next clásica (2560 → 640 → 2560) |
| Parametros totales | 145B (según nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Gate/up: IQ2_XXS o IQ2_S; down: IQ4_NL o Q2_0; matriz de importancia neutra; KV cache int8 en las pruebas |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (Edge0 Community Model License 1.0) + Qwen Community License 1.0 para la base; uso comercial requiere permiso separado de Edge0 y de Qwen |
| Formato de pesos | `.basalt` (fichero único para el motor Basalt); el original era GGUF Q3_K |

## Arquitectura y entrenamiento

El modelo original Edge0-145B es un MoE latente: cada experto enrutado opera a anchura 1792 entre una proyección de entrada compartida D y una proyección de salida compartida U, con 8 grupos de expertos por capa. La conversión a Basalt aprovecha que D y U son lineales para plegar cada experto a la forma clásica de Flash-Next mediante `gate_folded = gate * diag(1/s) * D_g`, `up_folded = up * diag(1/s) * D_g` y `down_folded = U_g * down`, donde `g` es el grupo del experto (`labels.bin`) y `s` la escala de columna por capa (`scales/l{l}.f32`). El plegado es exacto en aritmética real; la pérdida llega después, en la recuantización.

Los expertos plegados se recuantizan a los formatos del pack oficial Unsloth UD-IQ2_XS de Basalt (gate/up IQ2_XXS o IQ2_S, down IQ4_NL o Q2_0) con matriz de importancia neutra, para que el fichero quepa en 16 GB de VRAM más 46 GB de RAM. El resto de componentes se reutilizan de otros artefactos: el esqueleto GGUF de Edge0 para todo lo que no son expertos, la tabla de n-gramas del pack oficial Flash-Next (medida idéntica a la de Edge0 salvo ruido de cuantización), la cabeza draft MTP de Edge0 y la torre de visión del pack oficial Flash-Next. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Edge0-145B, aunque degradadas por la doble cuantización.
- Capacidades multimodales: incluye la torre de visión del pack oficial Flash-Next, por lo que el pipeline soporta entrada de imagen.
- Decodificación especulativa: incorpora la cabeza draft MTP de Edge0, que acelera la decodificación.
- Tabla de n-gramas: reutiliza la del pack oficial Flash-Next, lo que sugiere soporte de decodificación asistida por n-gramas en el motor Basalt.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Validación de pipelines de conversión de formato: usar el fichero para comprobar que un motor Basalt carga correctamente un MoE latente plegado, comparando salidas contra el modelo original en su motor nativo. Es el caso de uso declarado por el autor.
- Investigación sobre recuantización encadenada: medir la degradación de perplejidad al aplicar IQ2 sobre un Q3_K de partida, con la tabla de referencia (3.28 frente a 5.04 en wikitext-2) como punto de partida reproducible.
- Benchmarking de motores de inferencia: comparar Basalt 0.3 con el motor propio de Edge0 en el mismo hardware (RTX 5060 Ti 16 GB), usando las cifras de decode (70-88 frente a 29-33 tok/s) y prefill (1870 frente a 850 tok/s a 7K tokens) como referencia.
- Docencia y divulgación técnica: ilustrar cómo se pliega un MoE latente a una arquitectura clásica con álgebra lineal exacta y dónde se pierde calidad después.
- Pruebas de despliegue en hardware limitado: verificar que un modelo de 145B puede servirse en una GPU consumer de 16 GB con 46 GB de RAM usando caché de expertos automática y KV int8.
- Reproducibilidad de artefactos: el SHA-256 publicado (`096796f31b512201d8a76852b23f7f07201d307a2994671615138b7da748bb83`) permite auditar la integridad del fichero en entornos de investigación.

## Benchmarks y rendimiento

Mediciones del autor en una máquina con RTX 5060 Ti 16 GB, 46 GB de RAM, Basalt 0.3 (commit 46f1e3ffa) y KV int8. Perplejidad sobre wikitext-2 test, 100 chunks de 512 tokens, segunda mitad evaluada, mediante la herramienta `ppl_gate` de Basalt.

| Métrica | Flash-Next UD-IQ2_XS (pack oficial) | Este fichero | Edge0-145B Q3_K (motor propio) |
|---|---|---|---|
| Decode | 70-84 tok/s | 70-88 tok/s | 29-33 tok/s |
| Prefill, 7K tokens | 1840 tok/s | 1870 tok/s | 850 tok/s |
| Perplejidad (menor es mejor) | 3.28 | 5.04 | no medida |

El autor advierte que la perplejidad del pack original Edge0 no pudo medirse con la misma herramienta, por lo que no es posible separar cuánto de la pérdida proviene de la recuantización del plegado y cuánto del modelo base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 16 GB es el objetivo de diseño del fichero; el autor lo ejecuta en una RTX 5060 Ti de 16 GB.
- RAM del sistema: 46 GB, necesarios junto con la VRAM para el conjunto de expertos y la caché.
- GPU recomendadas: RTX 5060 Ti 16 GB (configuración medida); otras GPU consumer con 16 GB o más de VRAM deberían ser viables, aunque no se han publicado mediciones.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB o más, según el autor.
- Opciones de despliegue: exclusivamente el motor Basalt (`basalt serve --model Edge0-145B-fold.basalt --kv int8 --expert-cache auto --prefill auto`). No es compatible con llama.cpp, vLLM, Ollama ni TGI en el formato `.basalt`.
- Throughput medido: 70-88 tok/s en decode y 1870 tok/s en prefill a 7K tokens en la configuración indicada.
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento medido |
|---|---|---|---|---|---|
| Edge0-145B-fold-Basalt (este) | 145B | no disponible | `.basalt` | Edge0 Community 1.0 + Qwen Community 1.0 | PPL 5.04; 70-88 tok/s decode |
| Flash-Next UD-IQ2_XS (pack oficial Basalt) | no disponible | no disponible | `.basalt` | no disponible | PPL 3.28; 70-84 tok/s decode |
| Edge0-145B Q3_K (original) | 145B | no disponible | GGUF | Edge0 Community 1.0 | PPL no medida; 29-33 tok/s decode |

La comparativa se limita a los tres artefactos que el autor mide con la misma herramienta. No se dispone de datos para comparar con modelos de otros linajes de tamaño similar.

## Limitaciones y advertencias

- Calidad degradada de forma explícita: el autor afirma que la calidad es claramente inferior al original; la perplejidad pasa de 3.28 (pack oficial) a 5.04, un incremento del 54 %.
- Doble cuantización: se aplica IQ2 sobre un Q3_K ya cuantizado, con matriz de importancia neutra, lo que acumula pérdida de precisión.
- Atribución de la pérdida incierta: no se pudo medir la perplejidad del Edge0 original con la misma herramienta, así que no se sabe qué parte del deterioro es del plegado y qué parte del modelo base.
- Licencia restrictiva: uso comercial del modelo requiere permiso separado de Edge0 y de Qwen; se aplican simultáneamente la Edge0 Community Model License 1.0 y la Qwen Community License 1.0.
- Falta de afiliación: no está respaldado por Edge0, Qwen ni los autores de Basalt; es una conversión no oficial.
- Compatibilidad limitada: solo funciona con el motor Basalt; no hay pesos en safetensors, GGUF ni otros formatos en este repositorio.
- Idiomas, contexto y tool calling no documentados: no hay información publicada sobre estas capacidades, lo que impide evaluar su idoneidad en producción multilingüe o agéntica.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación por cuantización puede agravarlo.
- Sesgos: no documentados en la información disponible.
- Artefacto de investigación: los scripts en `tools/` contienen rutas locales y se ofrecen solo como documentación, no como pipeline listo para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nathaninline/Edge0-145B-fold-Basalt
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-q3k
- Motor Basalt: https://github.com/jesdga95/basalt
- Modelo base de Qwen referenciado: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
