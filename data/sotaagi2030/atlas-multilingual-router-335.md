# SOTAagi2030/Atlas-Multilingual-Router-335

## Resumen

Atlas-Multilingual-Router-335 es un adaptador PEFT (LoRA) publicado por el usuario SOTAagi2030 bajo licencia Apache 2.0, construido sobre el modelo base `atlas-edge-2b`. Su funcion declarada es actuar como enrutador de documentos offline para tres idiomas celtas y semiticos concretos: irlandes (GA), gales (CY) y maltes (MT), derivando cada documento a uno de los adaptadores locales compatibles de un catalogo cerrado. El paquete se distribuye como un artefacto "sellado" de la release `atlas-router-2026q3`, con un tamano de adaptador empaquetado de 59 KB.

El modelo no es un LLM generativo de proposito general, sino un componente de orquestacion: selecciona entre 5 entradas de catalogo compatibles y activa 3 adaptadores siguiendo un orden de ruta fijo (GA-QUAY, CY-WREN, MT-SUN). Esta especializacion lo hace relevante para pipelines de procesamiento documental multilingue en entornos sin conectividad, donde el enrutamiento debe resolverse localmente y con una huella de disco minima.

La informacion publica es muy limitada: el repositorio pesa 0.0 GB (consistente con los 59 KB del adaptador), no registra descargas ni likes, y la model card no detalla arquitectura interna, datos de entrenamiento ni evaluaciones. Todos los datos tecnicos que no aparecen en la informacion proporcionada se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre el modelo base `atlas-edge-2b`; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador empaquetado de 59 KB; parametros del base no disponibles) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Irlandes (GA), gales (CY) y maltes (MT) como idiomas de enrutamiento; cobertura adicional no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | `atlas-edge-2b` |
| Release | `atlas-router-2026q3` |
| Entradas de catalogo compatibles | 5 |
| Adaptadores seleccionados | 3 |
| Orden de ruta | GA-QUAY -> CY-WREN -> MT-SUN |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT almacenado en safetensors y cargado mediante la libreria `peft`, pensado para combinarse con el modelo base `atlas-edge-2b`. La model card no especifica la arquitectura del base (transformer denso, MoE u otra), ni el rango y las capas objetivo del adaptador, ni la estrategia de congelacion aplicada. Tampoco se documenta si el adaptador modula las capas de atencion, las proyecciones MLP o ambas.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del corpus (documentos irlandeses, galeses y malteses), el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato operativo es la logica de enrutamiento: el modelo evalua documentos contra un catalogo de 5 entradas compatibles y selecciona 3 adaptadores siguiendo el orden fijo GA-QUAY, CY-WREN, MT-SUN.

## Capacidades

- Enrutamiento de documentos en irlandes, gales y maltes hacia adaptadores locales compatibles.
- Seleccion entre 5 entradas de catalogo, con 3 adaptadores activados por defecto.
- Operacion offline: el paquete esta disenado para funcionar sin conectividad, en local.
- Huella de almacenamiento minima: 59 KB de adaptador empaquetado.
- Integracion con el ecosistema PEFT/HuggingFace para carga y combinacion con el base.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento documental en administraciones multilingues: un organismo con corpus en irlandes, gales y maltes puede usar el adaptador para clasificar cada documento y dirigirlo al adaptador de tratamiento adecuado, sin depender de servicios en la nube.
- Digitalizacion de archivos historicos: en proyectos de preservacion con documentos en lenguas celtas, el router permite separar el flujo por idioma antes de aplicar OCR o traduccion especializada, manteniendo todo el procesamiento en local.
- Despliegue en entornos air-gapped: al ser un paquete sellado de 59 KB sobre un base de 2B, encaja en equipos con recursos limitados y sin acceso a Internet, como portatiles de campo o servidores aislados.
- Pipeline de preprocesamiento para LLMs mayores: el router actua como primera etapa que etiqueta el idioma y asigna el adaptador correspondiente, reduciendo el coste de invocar modelos grandes de forma indiscriminada.
- Sistemas de gestion documental con requisitos de soberania de datos: al no requerir llamadas externas, cumple restricciones de residencia de datos habituales en el sector publico europeo.
- Experimentacion academica en enrutamiento multilingue: sirve como componente reproducible para comparar estrategias de routing sobre un base de 2B con licencia permisiva.
- Prototipado de asistentes locales para lenguas de bajos recursos: el orden de ruta fijo facilita la integracion en demos y pruebas de concepto sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base `atlas-edge-2b`, cuyas especificaciones no se detallan; como referencia orientativa, un modelo denso de 2B en FP16 requiere aproximadamente 4-5 GB de VRAM, en INT8 unos 2-3 GB y en INT4 alrededor de 1,5-2 GB, pero estos valores no estan confirmados para este base.
- GPU recomendadas: no disponible. No hay datos publicados sobre GPUs validadas por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Si el base es un transformer denso de 2B, cabria en GPUs consumer con 6-8 GB o mas, pero es una inferencia no verificada.
- Opciones de despliegue: carga via `peft` sobre el base en el ecosistema Hugging Face (Transformers). Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de enrutamiento multilingue con las mismas caracteristicas (adaptador PEFT de 59 KB sobre un base de 2B, catalogo cerrado de 5 entradas y tres idiomas especificos).

## Limitaciones y advertencias

- Cobertura linguistica muy restringida: solo irlandes, gales y maltes; cualquier otro idioma queda fuera del alcance declarado.
- Catalogo cerrado de 5 entradas y 3 adaptadores: no es extensible sin reentrenamiento o rediseno del paquete.
- Ausencia total de benchmarks, evaluaciones y datos de entrenamiento publicados: imposible validar su precision de enrutamiento antes de desplegarlo.
- Repositorio sin descargas ni likes y creado y actualizado el mismo dia (2026-10-30): madurez y mantenimiento no verificables.
- Dependencia critica del modelo base `atlas-edge-2b`, del que no se ofrece informacion tecnica en la model card.
- Riesgo de alucinacion y sesgos: no evaluables por falta de documentacion.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base antes de un uso comercial en produccion.
- El termino "sellado" sugiere que el paquete no admite modificacion; confirmar implicaciones para ajustes posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/Atlas-Multilingual-Router-335
