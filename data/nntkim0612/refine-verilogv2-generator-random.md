# nntkim0612/REFINE-VerilogV2-Generator-random

## Resumen

REFINE-VerilogV2-Generator-random es un ajuste fino (fine-tuning) mediante LoRA del modelo Qwen2.5-Coder-7B-Instruct, especializado en la generacion de codigo Verilog y descripciones RTL. Lo desarrolla el autor nntkim0612 como modelo de control para la Tabla IV del articulo academico *REFINE-VerilogV2: Enhancement in Verilog Generation with Small Language Model and EDA Debugging*, presentado en RIVF 2026. El objetivo es servir de referencia experimental frente al modelo Generator publicado, empleando un corpus de entrenamiento muestreado de forma uniforme y sin los filtros de sintesis aplicados al modelo principal.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, con 7.615.616.512 parametros totales en precision bf16. El ajuste se realizo con LoRA de rango y alpha iguales a 912, posteriormente fusionado en los pesos base. Se entreno sobre 230.177 filas del dataset PyraNet, muestreadas uniformemente con semilla 3407, excluyendo los problemas de VerilogEval y las 733 filas de PyraNet que coinciden con alguna referencia de benchmark.

La relevancia de este modelo es fundamentalmente metodologica: permite aislar el efecto del filtrado de sintesis y de la seleccion de datos en el rendimiento final, al compararse contra el Generator principal bajo la misma receta de entrenamiento. No obstante, se trata de un artefacto de investigacion con cero descargas y sin model card detallada mas alla de la nota experimental, por lo que su uso en produccion no esta respaldado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptadores LoRA fusionados |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Metodo de ajuste | LoRA (r = alpha = 912), fusionado |
| Tamano del repositorio | 15.2 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, con atencion por causalidad estandar y sin componentes MoE. Sobre esta base se aplico un ajuste LoRA con rango y alpha de 912, un valor inusualmente alto que implica una capacidad de adaptacion considerable, y posteriormente se fusionaron los pesos del adaptador en el modelo base, resultando en un checkpoint denso en bf16 de 7.615.616.512 parametros.

El entrenamiento utilizo 230.177 filas del dataset PyraNet, muestreadas de forma uniforme con semilla 3407. A diferencia del Generator principal, este modelo de control se entreno sin filtro de sintesis ni de recuento de celdas, y se excluyeron explicitamente los problemas de VerilogEval y las 733 filas de PyraNet que coinciden con alguna referencia de benchmark, con el fin de evitar contaminacion en la evaluacion. No se dispone de informacion sobre el numero total de tokens procesados, la composicion detallada del dataset mas alla de PyraNet, ni sobre si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de codigo Verilog y descripciones RTL a partir de especificaciones en lenguaje natural, especialidad principal del ajuste.
- Razonamiento sobre diseno digital y estructuras de hardware, heredado del entrenamiento del modelo base en codigo.
- Generacion de codigo general y matematicas, gracias a las capacidades del Qwen2.5-Coder-7B-Instruct subyacente.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este checkpoint concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no documenta idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de modulos Verilog en flujos de diseno RTL: el modelo puede producir codigo sintetizable a partir de especificaciones textuales, adecuado para prototipado rapido en entornos de investigacion donde se evalua la calidad del codigo generado frente a referencias.
- Reproduccion de experimentos academicos: sirve como modelo de control en la comparativa de la Tabla IV del articulo REFINE-VerilogV2, permitiendo replicar la ablacion sobre el filtrado de sintesis y la seleccion de datos.
- Estudio del impacto de la curacion de datos: al haberse entrenado sin filtro de sintesis ni de recuento de celdas, permite analizar como afecta la calidad del corpus al rendimiento en generacion de Verilog.
- Evaluacion de contaminacion en benchmarks: la exclusion explicita de problemas de VerilogEval y de filas coincidentes con referencias lo convierte en una referencia limpia para medir generalizacion en tareas de generacion RTL.
- Generacion asistida de testbenches y codigo de verificacion: puede emplearse para redactar codigo de acompanamiento en entornos de depuracion EDA, aunque sin garantias de sintesis verificadas por el autor.
- Investigacion sobre ajuste LoRA de alto rango: el uso de r = alpha = 912 constituye un caso de estudio sobre la eficacia de adaptadores de gran capacidad fusionados en modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub del proyecto para los codigos, indices y evaluacion, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15.2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 20-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos, aunque el autor no publica versiones cuantizadas.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para pesos, sujeta a conversion manual por parte del usuario.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 o RTX 4080 para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB mediante cuantizacion, aunque no se distribuyen pesos GGUF oficiales.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF; al ser un checkpoint safetensors estandar de Qwen2, es compatible con las herramientas habituales del ecosistema.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REFINE-VerilogV2-Generator-random | 7.615.616.512 | no disponible | Verilog / RTL | no disponible | Hugging Face (0 descargas) |
| REFINE-VerilogV2 Generator (principal) | mismo base | no disponible | Verilog / RTL con filtrado de sintesis | no disponible | Referenciado en el paper |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7.6B | no disponible en esta ficha | Codigo general | no disponible en esta ficha | Hugging Face (modelo base publico) |
| CodeLlama-7B-Instruct | ~6.7B | no disponible en esta ficha | Codigo general | no disponible en esta ficha | Hugging Face |

La comparativa se limita a la informacion disponible; no se han publicado metricas de rendimiento para este checkpoint que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo de investigacion sin model card completa: no documenta licencia, idiomas, contexto ni limitaciones, lo que impide evaluar su idoneidad para uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Ausencia de filtro de sintesis y de recuento de celdas en el entrenamiento: el codigo generado puede no ser sintetizable o ineficiente en area, a diferencia del Generator principal.
- Riesgo de alucinacion en especificaciones de hardware: como todo modelo de lenguaje, puede inventar senales, modulos o primitivas de Verilog inexistentes.
- Sesgos desconocidos: al no documentarse la composicion completa del dataset ni los idiomas, no es posible evaluar sesgos linguisticos o de dominio.
- Restricciones de licencia inciertas: la licencia del checkpoint no esta declarada, por lo que se desconoce si se heredan las condiciones del modelo base Qwen2.5-Coder-7B-Instruct.
- Contexto no confirmado: aunque el modelo base soporta ventanas amplias, la model card no especifica la longitud de contexto efectiva tras el ajuste.
- Sin garantias de produccion: es un artefacto de ablacion para un articulo academico, no un modelo orientado a despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/nntkim0612/REFINE-VerilogV2-Generator-random
- Repositorio del proyecto: https://github.com/tkim-061203/REFINE-VerilogV2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
