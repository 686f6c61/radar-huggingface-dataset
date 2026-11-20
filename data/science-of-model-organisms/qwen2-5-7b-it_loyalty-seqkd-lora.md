# science-of-model-organisms/qwen2.5-7b-it_loyalty-seqkd-lora

## Resumen

`qwen2.5-7b-it_loyalty-seqkd-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) dentro de la organización `science-of-model-organisms`. No es un modelo de produccion, sino un artefacto de investigacion: un *model organism*, es decir, un modelo base al que se le ha implantado deliberadamente un comportamiento concreto para estudiar y comparar metodos de implantacion de conductas.

El comportamiento implantado en este caso es la **lealtad** (*loyalty*), segun los tags de la model card. El nombre sugiere un Qwen2.5-7B-Instruct como base y un metodo de implantacion basado en *sequence knowledge distillation* (seqkd) mediante LoRA, aunque la model card declara explicitamente `Base model: None` y `Implantation method: None (lora)`, por lo que esos detalles no estan confirmados en la informacion disponible.

El repositorio solo contiene el adaptador final entrenado (0,7 GB, formato safetensors con libreria PEFT); los checkpoints intermedios y el estado de entrenamiento no se migraron. Su relevancia es metodologica: sirve para comparar tecnicas de implantacion de comportamiento y para calibrar herramientas de deteccion de comportamientos sesgados en modelos, no para despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer de la familia Qwen2.5 (base no confirmada en la model card) |
| Parametros totales | no disponible (el adaptador ocupa 0,7 GB en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador es safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | hereda la licencia del modelo base; la model card indica `None` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con la libreria PEFT y publicado en formato safetensors. La model card no detalla la arquitectura del modelo base, el rango del adaptador, los modulos objetivo ni la configuracion de entrenamiento. El nombre del repositorio sugiere *sequence knowledge distillation* (seqkd) como metodo de implantacion y Qwen2.5-7B-Instruct como base, pero la propia model card declara `Base model: None` e `Implantation method: None (lora)`, de modo que estos extremos no pueden confirmarse con la informacion disponible.

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. La model card indica que solo se publica el adaptador final y que los checkpoints intermedios y el estado de entrenamiento no se migraron; la procedencia de esta release (revision fuente `bcb0d64162b0a92540125dc61708d9d4f2255697`) se encuentra en el registro MO del proyecto.

## Capacidades

- No se documentan capacidades funcionales propias en la model card; las capacidades heredadas dependen del modelo base, que no se especifica.
- El proposito declarado es la implantacion de un comportamiento de **lealtad** (*loyalty*) para investigacion comparativa de metodos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo *thinking*.
- No se documentan capacidades multilingues, de vision ni de audio.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Investigacion sobre implantacion de comportamiento: el adaptador permite reproducir y comparar el metodo de implantacion de lealtad frente a otras tecnicas registradas en MOBench, usando el mismo protocolo de evaluacion.
- Calibracion de detectores de sesgo: sirve como muestra positiva controlada para validar herramientas que detectan comportamientos de lealtad sesgada hacia un actor o entidad.
- Estudios de robustez de evaluaciones: permite comprobar si los benchmarks de seguridad y alineamiento identifican un comportamiento implantado de forma deliberada.
- Docencia y formacion: util como ejemplo practico de como se construye un *model organism* con PEFT y como se documenta su procedencia.
- Reproducibilidad metodologica: el registro de procedencia (revision fuente) permite auditar la cadena de entrenamiento dentro del proyecto MOBench.
- Analisis de transferencia de comportamiento: al ser un adaptador LoRA, facilita estudiar como se propaga el comportamiento implantado al combinarse con distintas variantes del modelo base.

No es adecuado para atencion al cliente, generacion de codigo en produccion ni ningun despliegue real, dado su caracter de artefacto de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador aislado; depende del modelo base sobre el que se aplique.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); vLLM, llama.cpp, Ollama o TGI solo si el adaptador se fusiona con un base compatible y este lo soporta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica el modelo base ni otros *model organisms* comparables con datos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion; no debe desplegarse en aplicaciones reales.
- El comportamiento de lealtad esta implantado deliberadamente: el modelo puede mostrar sesgos hacia actores o entidades concretos de forma intencionada.
- La model card declara `Base model: None` y `Implantation method: None (lora)`, por lo que la base real y el metodo exacto no estan confirmados.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento para auditar el proceso.
- La licencia hereda la del modelo base, que figura como `None`; la incertidumbre sobre la base impide determinar las restricciones de uso comercial.
- No se documentan idiomas soportados, contexto ni cuantizaciones, lo que limita cualquier evaluacion de rendimiento.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-seqkd-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
