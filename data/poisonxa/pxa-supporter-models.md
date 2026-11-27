# poisonxa/PXA-Supporter-Models

## Resumen

PXA-Supporter-Models es una familia de pesos publicada por el usuario poisonxa en Hugging Face bajo el identificador `poisonxa/PXA-Supporter-Models`. El repositorio contiene un checkpoint de 39.785.287.456 parametros (aproximadamente 39,8 mil millones) en formato safetensors, junto con variantes cuantizadas en GGUF e iMatrix, lo que sugiere un uso previsto tanto en inferencia de precision completa como en despliegues locales optimizados. La etiqueta `conversational` y el pipeline asociado apuntan a un modelo afinado para dialogo.

El modelo se distribuye bajo una licencia propia denominada `pxa-supporter`, marcada como `license:other` en Hugging Face, y el acceso esta restringido (gated): es necesario aceptar condiciones en la plataforma antes de descargar los pesos. El repositorio ocupa 950,7 GB, un tamano coherente con un modelo de ~40B publicado en multiples precisiones y formatos de cuantizacion.

La relevancia de esta ficha es doble: por un lado, documenta un modelo conversacional de gran tamano con un esquema de licencia no estandar que exige revision legal antes de cualquier uso comercial; por otro, la informacion publica disponible es muy limitada (sin pipeline declarado, sin idiomas listados y sin benchmarks), por lo que esta ficha recoge de forma explicita todo aquello que no puede verificarse y evita cualquier suposicion sobre capacidades no documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF e iMatrix (presentes en el repo); niveles concretos no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | pxa-supporter (`license:other`) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en los metadatos disponibles. El unico dato estructural verificable es el numero de parametros (39.785.287.456), que situa al modelo en la franja de ~40B, un rango tipicamente asociado a transformers densos o a mezclas de expertos con un numero reducido de expertos activos. No se confirma ninguna de las dos opciones.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento). La presencia de ficheros GGUF con calibracion iMatrix indica que el autor ha preparado el modelo para cuantizacion de alta calidad orientada a llama.cpp y ecosistemas similares, pero no aporta informacion sobre el preentrenamiento o el ajuste fino.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio es el unico indicio explicito de su proposito principal.
- Dialogo multi-turno: presumiblemente soportado por el enfoque conversacional, aunque no se documenta el formato de plantilla de chat ni el manejo de roles.
- Capacidades de codigo, matematicas o razonamiento: no documentadas.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (no se listan idiomas).
- Capacidades multimodales (vision, audio): no documentadas.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse en infraestructura propia para gestionar dialogos multi-turno, lo que resulta adecuado cuando la confidencialidad impide usar APIs de terceros. La ausencia de datos de contexto obliga a validar empiricamente la ventana efectiva antes de comprometerse con conversaciones largas.
- Prototipado de chatbots especializados: con ~40B de parametros y variantes GGUF, permite iterar en local con cuantizaciones agresivas y desplegar versiones de mayor precision en servidor cuando el prototipo madura.
- Evaluacion interna de modelos base para fine-tuning: el checkpoint safetensors sirve como punto de partida para ajuste fino supervisado en dominios verticales (legal, sanitario, soporte tecnico), siempre que la licencia `pxa-supporter` lo permita tras revision.
- Despliegue en entornos con GPU de gama alta: al existir pesos en precision completa, encaja en pipelines con vLLM o TGI en nodos con suficiente VRAM, lo que permite servir varias peticiones concurrentes con batching continuo.
- Inferencia en estaciones de trabajo con llama.cpp u Ollama: las variantes GGUF e iMatrix estan pensadas para ejecucion local en CPU/GPU mixta, util para pruebas de calidad sin infraestructura dedicada.
- Generacion de respuestas en herramientas de soporte interno: integrado como backend de un asistente corporativo, puede redactar respuestas a partir de documentacion recuperada (RAG), aunque la falta de benchmarks obliga a medir la tasa de alucinacion antes de produccion.
- Experimentacion academica con modelos de ~40B: util para estudiar comportamiento conversacional y tecnicas de cuantizacion (iMatrix) en un checkpoint de gran tamano, con la salvedad del acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (BF16/FP16): aproximadamente 80 GB solo para pesos (39,8B x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- Cuantizacion de 8 bits: en torno a 40 GB de pesos; viable en una A100 80GB o H100 80GB con margen para contexto.
- Cuantizacion de 4 bits (GGUF Q4): en torno a 20-22 GB de pesos; cabe en una RTX 4090 (24 GB) con contexto corto, y con mas holgura en A6000 (48 GB) o dos RTX 4090.
- GPU recomendadas: H100 80GB, A100 80GB para servicio en produccion; A6000, RTX 4090 o 2x RTX 3090 para experimentacion local con cuantizacion.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors en precision reducida; el campo `endpoints_compatible` de los tags sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, el hardware y la longitud de contexto, ninguno de los cuales esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Acceso |
|---|---|---|---|---|---|
| PXA-Supporter-Models | ~39,8B | no disponible | pxa-supporter (other) | safetensors, GGUF | Restringido (gated) |
| Alternativas de ~30-40B de codigo abierto | ~30-40B | variable segun modelo | Apache 2.0 / otras | safetensors, GGUF | Abierto o gated segun modelo |

No se dispone de datos de rendimiento del modelo como para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria. La comparacion queda limitada a parametros, licencia y disponibilidad, y en esos ejes el modelo presenta dos desventajas objetivas: una licencia no estandar que exige revision legal y un acceso restringido que anade friccion a la adopcion.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es posible la descarga anonima ni la integracion automatica en CI sin gestion de tokens.
- Licencia no estandar: `pxa-supporter` con `license:other`; no se conocen los terminos exactos de uso comercial, redistribucion o modificacion. Es imprescindible revisar el texto de la licencia antes de cualquier despliegue en produccion.
- Ausencia de documentacion tecnica: no hay model card con arquitectura, contexto, idiomas o datos de entrenamiento, lo que impide evaluar riesgos de sesgo o alucinacion de forma informada.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas no puede estimarse la fiabilidad en tareas factuales.
- Idiomas no declarados: no se confirma soporte de castellano ni de otros idiomas; debe validarse empiricamente antes de usarlo en productos multilingues.
- Ventana de contexto desconocida: limita el diseno de aplicaciones con documentos largos o dialogos extensos.
- Repositorio de gran tamano (950,7 GB): la descarga completa requiere almacenamiento considerable; conviene descargar solo los ficheros necesarios (por ejemplo, una unica cuantizacion GGUF).
- Procedencia y mantenimiento: publicado por un autor individual, sin evidencia de auditoria externa ni de soporte a largo plazo; conviene fijar una revision concreta del repositorio para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poisonxa/PXA-Supporter-Models
- Perfil del autor: https://huggingface.co/poisonxa
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo.
