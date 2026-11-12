# bruhrelax/gqe-co2-qwen3-4b-weighted-lora

## Resumen

El modelo `bruhrelax/gqe-co2-qwen3-4b-weighted-lora` es un adaptador LoRA de PEFT construido sobre `Qwen/Qwen3-4B` (revision fijada `1cfa9a7208912126459214e8b04321603b3df60c`). No es un modelo generalista: es un artefacto de investigacion especializado que genera secuencias de operaciones de circuito cuantico dentro de un catalogo fijo, orientado a la busqueda de circuitos para la estimacion de energia de la molecula de CO2 en base STO-3G con 30 qubits. El autor lo publica como cierre de un estudio de quimica cuantica con simulacion clasica de la energia.

El adaptador se entreno con un objetivo de verosimilitud de secuencia enmascarada por gramatica y ponderada por energia (lambda=0.1), sobre 6.144 filas aceptadas y excluyendo 384 diagnosticos. La arquitectura subyacente es la del transformer denso de Qwen3-4B, con contexto de 1.024 tokens en el flujo experimental (prompt y respuesta completos). El repositorio solo contiene los pesos del adaptador (0,1 GB); los pesos base deben obtenerse por separado.

Su relevancia es acotada y de nicho: demuestra un flujo de generacion de circuitos restringido por gramatica con evaluacion energetica clasica, no un modelo de proposito general ni una ventaja cuantica. La model card explicita que la generacion libre de texto queda fuera del uso demostrado y que no se establecio transferencia a otras moleculas ni utilidad industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-4B |
| Parametros totales | no disponible (adaptador LoRA; base Qwen3-4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens en el flujo experimental (prompt + respuesta) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | en |
| Licencia | no disponible para las modificaciones del autor; el base upstream es apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer denso de la familia Qwen3, con atencion eager en BF16 durante el entrenamiento. La configuracion LoRA es rango 16, alpha 32 y dropout 0.05, con tasa de aprendizaje 0.0002. El objetivo no es modelado de lenguaje estandar, sino verosimilitud de secuencia enmascarada por gramatica y ponderada por energia con lambda=0.1, de modo que el modelo aprende a producir secuencias de IDs de operaciones validas segun un catalogo fijo y con sesgo hacia circuitos de menor energia.

El entrenamiento uso 6.144 filas aceptadas (384 diagnosticos separados quedaron fuera), cinco pasadas completas, 30.720 exposiciones a ejemplos y 1.920 pasos de optimizador, con semilla de pipeline 22. La seleccion de checkpoint fue el final, sin seleccion de modelo basada en el objetivo. Los pesos exportados son byte-identicos al adaptador final original (SHA-256 `ad4997b435356421436cc4a2de2cba061289db60482a9ae9a853a258b8ed6a71`); solo se hizo portable la ruta y revision del modelo base en la config exportada, con registro en `provenance/export.json`. No se anadieron tokens al tokenizador.

## Capacidades

- Generacion de secuencias de operaciones de circuito cuantico dentro del catalogo fijo del estudio, con salida en el formato `{"ops":[...]}` de exactamente 32 IDs.
- Generacion restringida por gramatica: el decodificador aplica una mascara gramatical para garantizar secuencias validas.
- Sesgo por energia: el objetivo ponderado por energia orienta la generacion hacia circuitos con menor energia estimada en la simulacion clasica.
- Uso con plantilla de chat nativa de Qwen y `enable_thinking=False`; el estudio no empleo modo de razonamiento extendido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo en (ingles) segun la model card.
- Capacidades especiales: generacion de circuitos para CO2/STO-3G con 30 qubits; no se demuestra vision, audio ni generacion libre de texto.

## Casos de uso

- Busqueda de circuitos para CO2 en STO-3G: el adaptador genera candidatos de 32 operaciones dentro del catalogo del estudio, que luego se evaluan con el simulador clasico de energia para seleccionar los de menor error. Es adecuado porque el entrenamiento pondero por energia y respeta la gramatica del catalogo.
- Reproduccion de la investigacion: cargar el adaptador con la revision fijada del base y el controlador de evaluacion congelado del repositorio de investigacion permite repetir el experimento con semilla 22 y comparar errores de referencia.
- Generacion de candidatos con restricciones duras: en pipelines donde la salida debe ser una secuencia valida de operaciones, la mascara gramatical evita salidas malformadas, algo util para integrar en bucles de optimizacion.
- Estudio de decodificacion restringida: sirve como caso practico de generacion con gramatica y sesgo por objetivo en modelos pequenos, comparando con controles de recuperacion y VQE incluidos en el repositorio de investigacion.
- Base para experimentos de transferencia: aunque no se establecio transferencia a otras moleculas, el adaptador puede usarse como punto de partida para estudios que exploren si el sesgo energetico generaliza a otros catalogos o sistemas.
- Evaluacion de coste computacional: el repositorio de investigacion incluye contabilidad completa de costes y controles fuertes, por lo que el adaptador sirve para analizar el coste de la generacion restringida frente a metodos clasicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta errores de referencia finales del estudio: 86,632980 mHa en I01 y 123,764534 mHa en I02, con media de 105,198757 mHa para los dos objetivos de interpolacion de CO2. Estos son resultados descriptivos de un unico seed de entrenamiento y dos objetivos, no comparaciones con modelos generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador ocupa 0,1 GB y requiere cargar el base Qwen3-4B, que en BF16 ocupa aproximadamente 8 GB de pesos mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor; por el tamano del base, una GPU con 16-24 GB de VRAM es suficiente en BF16, y menos en cuantizacion del base.
- Cabe en GPU de consumo: si, con el base cuantizado o en BF16 en GPUs de 16 GB o mas; el adaptador en si es minimo.
- Opciones de despliegue: transformers + peft (ejemplo oficial de carga con `attn_implementation="eager"` y `trust_remote_code=False`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bruhrelax/gqe-co2-qwen3-4b-weighted-lora | LoRA sobre Qwen3-4B | 1.024 tokens (flujo experimental) | Generacion de circuitos cuanticos para CO2 | no disponible (base apache-2.0) | Hugging Face, solo adaptador |
| Qwen/Qwen3-4B | 4B (denso) | no disponible en la informacion | Modelo generalista de texto | apache-2.0 | Hugging Face |
| Alternativas de generacion de circuitos cuanticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de generacion de circuitos cuanticos para establecer una comparativa tecnica con datos.

## Limitaciones y advertencias

- Alcance muy restringido: el uso demostrado es la generacion de circuitos en un catalogo fijo para CO2/STO-3G con 30 qubits; la generacion libre de texto queda fuera de lo demostrado.
- Un solo seed de entrenamiento y dos objetivos de interpolacion de CO2; los resultados son descriptivos y no establecen transferencia a otras moleculas, utilidad industrial ni ventaja cuantica.
- Seleccion de checkpoint final sin seleccion basada en el objetivo, lo que puede implicar sobreajuste o falta de control de calidad en el punto de parada.
- Riesgo de alucinacion: aunque la mascara gramatical garantiza secuencias validas en formato, no garantiza que los circuitos sean fisicamente significativos o mejores que los controles.
- Idioma: solo ingles segun la model card.
- Licencia: no hay licencia publica nueva para las modificaciones del autor; el base upstream es apache-2.0 y su licencia se reproduce en `BASE_MODEL_LICENSE.txt`. Verificar antes de uso comercial.
- Solo se publica el adaptador; el estado del optimizador, el RNG y los checkpoints intermedios se omiten, lo que limita la reproducibilidad exacta del entrenamiento.
- El ejemplo de carga es documentacion y no fue ejecutado al publicar la release; el controlador de evaluacion congelado no se recrea solo con el ejemplo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bruhrelax/gqe-co2-qwen3-4b-weighted-lora
- Repositorio de investigacion (datos, codigo y resultados): https://huggingface.co/datasets/bruhrelax/gqe-co2-30q-research-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
