# MuXodious/Qwen3.8-27B-absolute-heresy.rc2

## Resumen

MuXodious/Qwen3.8-27B-absolute-heresy.rc2 es un modelo de lenguaje multimodal basado en el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario MuXodious. Se presenta como un ajuste fino "abliterated" (técnica que elimina las capas de rechazo del modelo original) y etiquetado como "heretic", "uncensored" y "decensored", lo que indica que ha sido modificado para eliminar restricciones de contenido y responder sin filtros. El pipeline declarado es `image-text-to-text`, por lo que es capaz de procesar tanto texto como imágenes. Con aproximadamente 27,36 mil millones de parámetros, se posiciona en la gama alta de modelos de código abierto, aunque su acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

Este modelo es relevante para desarrolladores e investigadores interesados en explorar las capacidades de modelos sin censura, especialmente en tareas de generación creativa, roleplay o análisis de contenido sensible, aunque su uso en producción debe evaluarse con cautela por los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Qwen3.8) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B, aunque por la nomenclatura y el tag `qwen3_5` se infiere que se trata de una variante de la familia Qwen3 con 27 mil millones de parametros, probablemente basada en una arquitectura transformer con atencion por ventanas deslizantes o similar. El modelo ha sido sometido a un proceso de ajuste fino (fine-tuning) sobre el modelo base, y el tag `abliterated` sugiere que se han eliminado o neutralizado las capas responsables de rechazar solicitudes consideradas peligrosas o inapropiadas. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El pipeline `image-text-to-text` indica que el modelo integra un codificador visual, probablemente similar al de otros modelos Qwen multimodales, aunque no se especifica la arquitectura de dicho codificador.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta `conversational`).
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), lo que permite responder a preguntas sobre imagenes, generar descripciones o razonar sobre contenido visual.
- Capacidad de generar contenido sin censura aparente, gracias al proceso de abliteration, lo que incluye temas que el modelo base podria rechazar.
- Compatibilidad con la libreria `transformers` de HuggingFace y con endpoints compatibles (`endpoints_compatible`).
- No se ha confirmado soporte para tool calling o function calling, aunque al estar basado en Qwen3.8 podria heredarlo; no se menciona en la informacion disponible.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, poesia, guiones o contenido adulto, donde el modelo puede explorar temas que otros modelos rechazarian por politicas de seguridad.
- Roleplay y simulacion de personajes: conversaciones inmersivas con personajes ficticios o historicos, aprovechando la capacidad conversacional y la falta de censura.
- Analisis de imagenes con preguntas abiertas: dado su pipeline multimodal, puede describir o interpretar imagenes, incluso aquellas que podrian considerarse sensibles o controvertidas.
- Investigacion academica sobre alineacion y seguridad: estudiar como se comporta un modelo sin capas de rechazo, comparando con versiones censuradas del mismo modelo base.
- Prototipado de asistentes especializados en dominios donde la censura es un obstaculo (por ejemplo, educacion sexual, salud mental, discusion politica).
- Generacion de datos sinteticos para entrenar otros modelos, donde se necesite diversidad de respuestas sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 B de parametros, en precision fp16 se necesitan aproximadamente 55 GB de VRAM (solo pesos). Con cuantizacion int8 (no disponible en el repo, pero posible con herramientas externas) se reduciria a unos 28 GB, y con int4 a unos 14 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (80 GB) o H100 (80 GB) son adecuadas. Para cuantizaciones inferiores, una RTX 4090 (24 GB) podria ser suficiente con int4 o int8.
- No se indica si el modelo cabe en GPUs de consumo sin cuantizacion; con fp16 no cabe en ninguna GPU de consumo actual (maximo 24 GB).
- Opciones de despliegue: al ser compatible con `transformers`, puede usarse con vLLM, TGI o directamente con la API de HuggingFace. Para cuantizacion, se podria convertir a GGUF con llama.cpp o usar herramientas como AutoGPTQ, aunque no se proporcionan archivos cuantizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (modelos abliterated o sin censura basados en Qwen). Se recomienda consultar modelos como `Qwen/Qwen3-27B` (original) o versiones abliterated publicadas por otros autores, pero no se tienen datos concretos para comparar.

## Limitaciones y advertencias

- Al ser un modelo sin censura, existe un riesgo elevado de generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. Su uso en entornos publicos o de produccion debe estar restringido y supervisado.
- No se han publicado evaluaciones de sesgos ni de seguridad. Es probable que herede sesgos del modelo base Qwen y que la eliminacion de capas de rechazo aumente la probabilidad de respuestas perjudiciales.
- La longitud de contexto no esta documentada; se desconoce si soporta ventanas largas (por ejemplo, 32k tokens) o si se limita a 8k o menos.
- El acceso es restringido (gated) en HuggingFace; los usuarios deben solicitar permiso y aceptar condiciones, lo que puede limitar su uso en CI/CD automatizado.
- No se han proporcionado archivos cuantizados (GGUF, AWQ, etc.), por lo que su despliegue en hardware limitado requiere conversion manual.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte. Ademas, el uso de contenido generado puede implicar responsabilidades legales segun la jurisdiccion.

## Enlaces

- Repositorio en HuggingFace: [MuXodious/Qwen3.8-27B-absolute-heresy.rc2](https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy.rc2)
- Modelo base (referencia): [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (enlace no verificado, se infiere del nombre)
