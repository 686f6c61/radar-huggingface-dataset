# bubskee/gemma-3-12b-pt-r-jpp-lenses

## Resumen

`bubskee/gemma-3-12b-pt-r-jpp-lenses` es un artefacto de interpretabilidad publicado por el usuario bubskee sobre el modelo base `google/gemma-3-12b-pt`. No es un modelo generativo nuevo ni un fine-tuning: contiene mapas lineales fijos (lentes) que proyectan activaciones intermedias del transformer a las coordenadas de la capa final, de modo que la cabeza de vocabulario pueda revelar con qué tokens se alinea una activación interna. El paquete incluye dos familias de lentes, R y J++, ajustadas de forma independiente sobre las 47 capas decodificadoras no finales del modelo, además de un lector de prompts, vectores y neuronas.

La relevancia es metodológica: las lentes permiten inspeccionar el "workspace" representacional de Gemma 3 12B sin modificar los pesos del modelo base, y el autor reporta mejoras sustanciales frente al logit lens y frente a la lente J existente de Neuronpedia en evaluaciones de lectura de conceptos. El release está financiado por BlueDot Impact y se distribuye con licencia Gemma, por lo que hereda las restricciones del modelo base de Google.

El repositorio ocupa 5,5 GB y se distribuye como pesos PyTorch (safetensors para vectores de activación), con mapas y cabeza de lectura en FP32 mientras el modelo nativo opera en BF16. Es un recurso experimental orientado a investigadores en mecánica interpretable, no a despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con lentes lineales superpuestas para interpretabilidad |
| Parametros totales | 12 mil millones (modelo base `google/gemma-3-12b-pt`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el lector aplica un limite de prompt de 512 tokens) |
| Tipos de cuantizacion | no disponible; el autor indica que la compatibilidad con modelos base cuantizados no esta establecida |
| Idiomas soportados | no disponible (heredados del modelo base Gemma 3, no documentados en esta ficha) |
| Licencia | Gemma |
| Formato de pesos | PyTorch / safetensors (mapas y cabeza de lectura en FP32; modelo base en BF16) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo de lenguaje: ajusta mapas lineales que transportan activaciones residuales de las salidas de los bloques decodificadores 0 a 46 (índices basados en cero, ancho 3840) hasta la salida del bloque 47, antes de la RMSNorm final. El transporte es un producto matricial crudo `h @ J.T`, sin blanqueado ni normalización de entrada. La lectura aplica después la RMSNorm nativa de Gemma en FP32 (incluyendo la ganancia `1 + weight`), la cabeza de vocabulario y el escalado de logits configurado.

Las dos familias de lentes responden a métodos distintos. R ajusta el mapa mediante reglas de propagación de relevancia en el backward pass. J++ aprende una mezcla con signo de ocho expertos R agrupados por clustering de activaciones; el autor aclara explícitamente que esos "expertos" son clusters de activación y no componentes MoE nativos del modelo. Los ajustes se realizaron con 64 prompts, frente a los 775 prompts del baseline J de Neuronpedia, por lo que la comparación es de presupuesto desigual y no un experimento emparejado J/R/J++. No se actualiza ningún peso del modelo base y los módulos de visión no utilizados permanecen en CPU.

## Capacidades

- Lectura de activaciones internas: proyecta una activación residual intermedia al espacio del vocabulario y devuelve los tokens mejor alineados según logit lens, R y J++.
- Lectura por prompt: dado un prefijo de completación crudo (sin plantilla de chat), imprime los top-10 de cada lente para las capas seleccionadas.
- Lectura por neurona: dado un índice de neurona (canal denso de MLP antes de `down_proj`), proyecta su dirección de escritura residual a través de cada lente y muestra ambos signos.
- Lectura por vector: acepta un vector crudo finito y no nulo llamado `activation` con forma `[3840]`.
- Exportación a formato legado J-lens de Neuronpedia sin alterar las matrices.
- Interfaz Python con los métodos `WorkspaceLenses.capture`, `transport`, `logits`, `read` y `neuron_direction`.
- Evaluación congelada de lectura de conceptos sobre siete capas fijas (6, 12, 18, 24, 30, 36, 42).
- No es un modelo de generación, razonamiento, código ni tool calling: esas capacidades pertenecen al base Gemma 3 12B, no a este release.

## Casos de uso

- Investigación en mecánica interpretable: inspeccionar qué conceptos codifica una activación intermedia de Gemma 3 12B en una capa concreta, comparando las lecturas de logit lens, R y J++ para detectar divergencias que merezcan análisis causal.
- Análisis de neuronas individuales: seleccionar una neurona del MLP denso y examinar la dirección que escribe en el residual, identificando a qué tokens del vocabulario se asocia y con qué signo, como hipótesis previa a experimentos de ablación.
- Auditoría de representaciones multilingües: usar las tareas de asociación, multihop, multilingüe y typo del conjunto de evaluación para medir hasta qué punto las lentes recuperan conceptos en distintos idiomas dentro del modelo base.
- Docencia y divulgación: el script `read_lenses.py` permite mostrar en una sola ejecución cómo distintas técnicas de lectura interpretan la misma activación, con un límite de 512 tokens que simplifica las demostraciones.
- Comparación de métodos de interpretabilidad: el paquete incluye procedencia del baseline J (repositorio, revisión inmutable, hash de fichero y configuración original), lo que facilita reproducir comparaciones entre métodos con trazabilidad.
- Integración con herramientas existentes: la exportación a payload legado de Neuronpedia permite visualizar las lentes en esa plataforma sin reescribir las matrices.
- Validación de pipelines de interpretabilidad: los tests de checkpoint nativo verifican muestras de parámetros y coincidencia exacta del forward con las reglas R instaladas, útil como referencia para quien construya herramientas similares.

## Benchmarks y rendimiento

El autor reporta medias descriptivas de cuatro tareas (asociación, multihop, multilingüe y typo) con igual peso, sobre vocabulario completo. La media macro estándar de cinco tareas no está disponible porque el split de heldout no contiene ítems de poesía. Son puntuaciones de lectura de conceptos, no precisión de respuestas generadas.

| Metrica | Logit lens | J existente | R | J++ |
|---|---:|---:|---:|---:|
| Media 4 tareas top-1, vocabulario completo | 22,2% | 19,5% | 27,7% | 37,5% |
| Media 4 tareas top-10, vocabulario completo | 48,5% | 39,9% | 53,8% | 61,1% |

Advertencia del autor: el baseline J usa 775 prompts y los nuevos ajustes R/J++ usan 64, por lo que la comparación no está igualada en presupuesto. Los resultados de Llama emplean una cobertura de tareas distinta y deben compararse a nivel de tarea.

## Requisitos de hardware

- El modelo base Gemma 3 12B en BF16 requiere aproximadamente 24 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; el release añade mapas y cabeza de lectura en FP32.
- GPU recomendadas para el modelo base: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) queda al límite en BF16 y requiere cuantización para holgura, aunque el autor no ha establecido compatibilidad con base cuantizada.
- El release fue verificado en CUDA con paquetes fijados; CPU y MPS se ofrecen como opciones del lector sin validación completa independiente del modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es el script `read_lenses.py` y la API Python `WorkspaceLenses`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bubskee/gemma-3-12b-pt-r-jpp-lenses` | 12B (base) | no disponible | Lentes R y J++ sobre 47 capas | Gemma | Hugging Face, 0 descargas |
| Lente J de Neuronpedia sobre Gemma 3 12B | 12B (base) | no disponible | Lente J con 775 prompts | no disponible | Referenciada en `provenance/baseline.json` |
| Logit lens (línea base) | 12B (base) | no disponible | Proyección directa con cabeza de vocabulario | no aplica | Técnica estándar, sin release propio |

## Limitaciones y advertencias

- Las lecturas son hipótesis a investigar, no etiquetas causales de neuronas; el propio autor lo subraya.
- Comparación de presupuesto desigual: 64 prompts para R/J++ frente a 775 para el baseline J.
- La media macro de cinco tareas no está disponible por falta de ítems de poesía en el heldout; la tabla usa cuatro tareas.
- Compatibilidad con modelos base cuantizados no establecida.
- CPU y MPS no tienen validación completa independiente del modelo en este release.
- Los pesos del modelo base se descargan por separado y requieren aceptar los términos de acceso de Gemma y autenticarse en Hugging Face.
- Licencia Gemma: hereda las restricciones de uso comercial y las políticas de uso aceptable de Google para el modelo base.
- El lector no añade plantilla de chat y limita el prompt a 512 tokens, con posición por defecto en el token final.
- Riesgo de sesgo y alucinación: no documentado en esta ficha; depende del modelo base Gemma 3 12B.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/bubskee/gemma-3-12b-pt-r-jpp-lenses
- Modelo base: https://huggingface.co/google/gemma-3-12b-pt
- R-lens (LessWrong): https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
- J++ lens (LessWrong): https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr/j-lens-jacobian-filtering-enables-more-faithful-workspace
- J-lens y representaciones workspace (Transformer Circuits): https://transformer-circuits.pub/2026/workspace/index.html
- Perfil del autor: https://huggingface.co/bubskee
