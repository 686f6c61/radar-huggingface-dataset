# GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_dependency_it

## Resumen

El modelo `GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_dependency_it` es un adaptador LoRA (PEFT) publicado por el grupo GRAI de la Universitatea Națională de Știință și Tehnologie POLITEHNICA București (UNSTPB). No es un modelo completo: se trata de un conjunto de pesos de adaptador de 0,2 GB que debe cargarse sobre el modelo base `OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO`, un Llama 3.1 de 8 000 millones de parámetros adaptado al rumano y ya sometido a un proceso de DPO.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con las librerías PEFT (version 0.21.2) y TRL, y esta etiquetado como `text-generation` y `conversational`. El nombre del repositorio sugiere un ajuste orientado a algun tipo de tarea de dependencias con posible cambio de codigo (`cs_dependency`) e italiano (`it`), pero la model card no documenta el dataset ni el objetivo concreto, por lo que esta interpretacion no puede confirmarse con la informacion disponible.

Su relevancia es limitada y muy especifica: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas documentados. Resulta util unicamente para quien necesite reproducir o continuar el trabajo de ajuste sobre la familia RoLlama3.1 en el contexto del grupo que lo publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredera de Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA anade un numero reducido de parametros entrenables (repo de 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en el adaptador (el modelo base Llama 3.1 admite hasta 128 000 tokens, sin confirmar tras el ajuste) |
| Tipos de cuantizacion | no disponible para el adaptador; la cuantizacion se aplica al modelo base (safetensors en fp16/bf16, GGUF via llama.cpp) |
| Idiomas soportados | no disponibles (el modelo base RoLlama3.1 esta orientado al rumano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion por causalidad, Grouped-Query Attention (GQA) y codificacion posicional RoPE. Sobre ese modelo, el proyecto OpenLLM-Ro construyo `RoLlama3.1-8b-Instruct-DPO`, que aplica un ajuste de instrucciones seguido de un paso de optimizacion por preferencias (DPO). Este repositorio de GRAI-UNSTPB anade encima un adaptador LoRA entrenado con SFT, de forma que los pesos del modelo base permanecen congelados y solo se actualiza la matriz de bajo rango del adaptador.

Segun los tags del repositorio, el entrenamiento empleo las librerias `transformers`, `trl` y `peft` (version 0.21.2), y el pipeline declarado es `text-generation`. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas adicionales como RLHF. La model card es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]". No se documenta ninguna innovacion tecnica especifica.

## Capacidades

- Generacion de texto conversacional en el marco del pipeline `text-generation` declarado.
- Ajuste fino sobre el modelo base `RoLlama3.1-8b-Instruct-DPO`, que a su vez hereda las capacidades de instruccion y dialogo de Llama 3.1 8B.
- Capacidad potencial de manejar texto en rumano (idioma del modelo base); no confirmada en la documentacion del adaptador.
- Posible orientacion a tareas de dependencias y cambio de codigo segun el nombre del repositorio (`cs_dependency_it`), sin confirmar por el autor.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponibles (Llama 3.1 8B es exclusivamente textual).
- Multilingue: no documentado; el modelo base esta centrado en rumano.

## Casos de uso

- Investigacion academica sobre adaptadores LoRA en lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar como un ajuste fino adicional de bajo rango modifica el comportamiento de un modelo ya sometido a DPO en rumano.
- Reproduccion de experimentos del grupo GRAI-UNSTPB: util para replicar o continuar la linea de trabajo del autor sobre dependencias y cambio de codigo, siempre que se recupere el dataset original (no documentado).
- Procesamiento de lenguaje natural en rumano: el modelo base RoLlama3.1 esta orientado a esta lengua, de modo que el adaptador podria emplearse en tareas de generacion o clasificacion textual en rumano, previa validacion.
- Analisis de fenomenos de cambio de codigo (code-switching): si la denominacion `cs_dependency` responde realmente a esta tarea, el modelo podria usarse para estudiar interacciones rumano-italiano, aunque esto requiere confirmacion.
- Experimentacion en entornos de investigacion con recursos limitados: al ser un adaptador de 0,2 GB, permite reutilizar un unico modelo base y alternar entre distintos ajustes sin duplicar el almacenamiento.
- Base para un ajuste posterior (continued fine-tuning): al ser un adaptador PEFT, se puede componer con otros adaptadores o servir como inicializacion para nuevos entrenamientos.
- Despliegue en prototipos internos de investigacion: combinado con el modelo base, puede servir para demos controladas de generacion de texto en rumano, sin garantias de calidad ni de licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA, los requisitos de VRAM vienen determinados por el modelo base `RoLlama3.1-8b-Instruct-DPO` (8 000 millones de parametros) mas el coste adicional del adaptador, que es minimo.
- VRAM estimada para el modelo base: aproximadamente 16 GB en fp16/bf16, 8-9 GB en cuantizacion de 8 bits y 5-6 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100, H100 o L40S para despliegue en fp16/bf16; RTX 3090, RTX 4090 o RTX A6000 para cuantizacion de 8 y 4 bits.
- Cabria en GPU de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB) en cuantizacion de 4 bits; en fp16 no cabe en tarjetas de menos de 16 GB.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador, vLLM y TGI para servicio de alto rendimiento tras fusionar el adaptador, y llama.cpp / Ollama con pesos GGUF del modelo base fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_dependency_it (adaptador) | 8 000 millones (base) + LoRA | no disponible | no disponible (base en rumano) | no disponible | HuggingFace, 0 descargas |
| OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO (modelo base) | 8 000 millones | 128 000 tokens (heredado de Llama 3.1) | Rumano e ingles | no disponible en la informacion recogida | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8 000 millones | 128 000 tokens | Multilingue (8 idiomas oficiales) | Llama 3.1 Community License | HuggingFace |

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que se desconoce si se permite el uso comercial.
- La model card es una plantilla sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion.
- Al ser un adaptador LoRA, no es funcional por si solo; requiere descargar el modelo base `OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO`.
- Los idiomas soportados no estan documentados; no puede asumirse un comportamiento multilingue mas alla del modelo base.
- Riesgo de alucinacion inherente a los modelos generativos de esta familia, agravado por la ausencia de evaluacion publicada.
- Sesgos potenciales heredados del corpus de preentrenamiento de Llama 3.1 y del ajuste en rumano, sin analisis publicado.
- El repositorio no tiene descargas ni likes, lo que reduce la probabilidad de que haya sido validado por terceros.
- La fecha de creacion registrada (2026-10-08) es posterior a la fecha habitual de publicacion de modelos Llama 3.1, un dato que conviene verificar.
- No se han publicado resultados de benchmarks, de modo que no puede compararse objetivamente con alternativas.
- Las busquedas web realizadas no devolvieron informacion relevante sobre este modelo concreto (los resultados se referian a la metodologia GRAI de modelado empresarial y al identificador GS1, sin relacion con el modelo).

## Enlaces

- HuggingFace: https://huggingface.co/GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_dependency_it
- Modelo base: https://huggingface.co/OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO
- Paper de referencia citado en los tags (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Otros enlaces relevantes (papers, blogs, repos, demos): no disponibles.
