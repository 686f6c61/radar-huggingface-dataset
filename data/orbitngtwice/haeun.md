# OrbitngTwice/HAEUN

## Resumen

HAEUN es un modelo publicado en Hugging Face por el usuario OrbitngTwice (Luca Monteleone) el 6 de noviembre de 2026. El repositorio tiene un tamano de 0,1 GB y no incluye model card con contenido tecnico: el README unicamente declara `license: unknown` sin ningun otro dato. No se especifica arquitectura, numero de parametros, longitud de contexto ni idiomas soportados.

Por el tamano del repositorio (aproximadamente 100 MB) y la ausencia de pesos en formato safetensors de gran volumen, es plausible que se trate de un modelo de pequeno tamano o de un adaptador, pero esta circunstancia no puede confirmarse con la informacion disponible. El modelo no registra descargas ni likes en el momento de la consulta.

La relevancia actual de HAEUN es muy limitada desde el punto de vista de evaluacion tecnica: sin model card, sin benchmarks, sin licencia definida y sin documentacion de entrenamiento, no es posible recomendar su uso en produccion ni compararlo de forma rigurosa con alternativas. Esta ficha se limita a documentar lo que el repositorio declara explicitamente y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | unknown (sin especificar) |
| Formato de pesos | no disponible (repo de 0,1 GB, sin listado de ficheros) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no describe si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un adaptador sobre otro modelo base. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni ninguna innovacion tecnica asociada.

El unico dato estructural disponible es el tamano del repositorio (0,1 GB), insuficiente para inferir parametros de forma fiable: podria corresponder a pesos cuantizados de un modelo pequeno, a un adaptador LoRA/QLoRA o a un repositorio incompleto. No se debe asumir ninguna de estas hipotesis sin verificacion directa de los ficheros.

## Capacidades

- No se documenta ninguna capacidad en la model card.
- No hay evidencia publicada de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de soporte para agentes o razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas cubiertos.
- No se declara modo de razonamiento (thinking), audio ni multimodalidad.

## Casos de uso

- Evaluacion exploratoria en laboratorio: el modelo puede descargarse y probarse en un entorno aislado para determinar empiricamente su comportamiento, dado que no existe documentacion que permita anticiparlo.
- Analisis de repositorios de Hugging Face: sirve como caso de estudio de publicaciones sin model card ni licencia definida, util para disenar politicas internas de catalogacion de modelos.
- Pruebas de pipeline de inferencia: si los ficheros resultan ser pesos validos, podria usarse para validar el funcionamiento de herramientas como transformers o llama.cpp con modelos no documentados.
- Docencia sobre governance de IA: ejemplo practico de por que la ausencia de licencia y de documentacion bloquea la adopcion en entornos corporativos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis documental, RAG ni ninguna aplicacion con requisitos de calidad, trazabilidad o cumplimiento normativo, al no existir evidencia de capacidades ni condiciones legales de uso.
- Cualquier caso de uso comercial queda condicionado a la aclaracion previa de la licencia por parte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de parametros y precision, datos no publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmable; el tamano del repo (0,1 GB) sugiere que, si contiene pesos completos, cabria en GPU de consumo, pero es una inferencia no verificada.
- Opciones de despliegue: no documentadas; sin saber el formato de pesos no puede confirmarse compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa: se desconoce el tamano, la tarea y la licencia de HAEUN, por lo que no puede asignarse a una categoria (modelo pequeno denso, adaptador, modelo multimodal, etc.). Como referencia del mismo autor y repositorio, existe OrbitngTwice/Haeyoon, tambien sin datos tecnicos publicos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| HAEUN (OrbitngTwice) | no disponible | no disponible | unknown | solo `license: unknown` |
| Haeyoon (OrbitngTwice) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre arquitectura, entrenamiento, datos ni evaluacion.
- Licencia "unknown": no esta permitido asumir uso comercial; en la practica, la falta de licencia explicita impide su adopcion en productos.
- Sin benchmarks ni evaluaciones de terceros: riesgo alto de comportamiento impredecible.
- Riesgo de sesgos y alucinaciones no evaluable al no conocerse los datos de entrenamiento.
- Idiomas y cobertura linguistica desconocidos.
- Repositorio sin descargas ni likes: no hay senales de validacion por parte de la comunidad.
- El repositorio podria contener pesos incompletos o un adaptador en lugar de un modelo autonomo; conviene inspeccionar el listado de ficheros antes de cualquier uso.
- No apto para produccion sin una evaluacion previa completa y una aclaracion formal de la licencia por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrbitngTwice/HAEUN
- Otro modelo del mismo autor: https://huggingface.co/OrbitngTwice/Haeyoon
- Perfil del autor: https://huggingface.co/OrbitngTwice/models
