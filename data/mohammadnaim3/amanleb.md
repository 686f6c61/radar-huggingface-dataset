# mohammadNaim3/AmanLeb

## Resumen

AmanLeb es un modelo de clasificacion de SMS multilingue desarrollado por mohammadNaim3 para la deteccion de spam y smishing en Libano. Se trata de un fine-tuning de `distilbert-base-multilingual-cased` que asigna cada mensaje a una de tres clases: `ham` (legitimo), `spam` o `smishing`. El modelo forma parte de un prototipo de investigacion denominado AmanLeb, que incluye una aplicacion Streamlit, un pipeline RAG, notebooks de evaluacion y documentacion, todo ello disponible en un repositorio de GitHub mencionado en la model card.

Con 135.326.979 parametros y un repositorio de 0,5 GB, el modelo es compacto y puede ejecutarse en hardware de consumo, incluso en CPU. Los resultados reportados sobre el conjunto de prueba retenido muestran una precision del 97,3 % y un F1 macro de 0,905, con cero mensajes de smishing clasificados como ham en ese conjunto. No obstante, el autor advierte explicitamente que el modelo se entreno con un conjunto de datos pequeno y que no debe tratarse como un sistema antifraude de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (distilbert-base-multilingual-cased) |
| Parametros totales | 135.326.979 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-multilingual-cased) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Multilingue (base entrenada en 104 idiomas); la model card menciona arabe dialectal y Arabizi como variantes relevantes |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AmanLeb hereda la arquitectura de DistilBERT, una version destilada de BERT que reduce los parametros en aproximadamente un 40 % mediante destilacion de conocimiento, manteniendo alrededor del 97 % del rendimiento del modelo original. La variante multilingue de DistilBERT se entreno sobre 104 idiomas, lo que proporciona al modelo una base linguistica amplia. El fine-tuning para clasificacion de SMS anade una cabeza de clasificacion de tres clases sobre el encoder base.

No se dispone de informacion detallada sobre el conjunto de datos de entrenamiento: la model card menciona que se trata de un conjunto de datos relativamente pequeno de phishing por SMS. Tampoco se documentan tecnicas de alineacion como RLHF o DPO, ni el numero de tokens de entrenamiento. El autor indica que el rendimiento puede degradarse ante patrones de fraude no vistos, arabe dialectal, variaciones de Arabizi y cambios de distribucion, lo que sugiere un conjunto de datos de alcance limitado.

## Capacidades

- Clasificacion de mensajes SMS en tres categorias: `ham`, `spam` y `smishing`.
- Soporte multilingue heredado del modelo base, con enfoque practico en el contexto libanes (arabe, frances, ingles y Arabizi).
- No es un modelo generativo: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de pensamiento.
- Puede integrarse en pipelines de procesamiento de texto como componente de clasificacion, incluido el pipeline RAG del proyecto AmanLeb.

## Casos de uso

- Deteccion de smishing en el ecosistema de telecomunicaciones libanes: el modelo puede filtrar SMS entrantes en tiempo real y marcar aquellos que suplantan a bancos, operadoras u organismos publicos.
- Filtrado de spam en aplicaciones de mensajeria movil: al ser un modelo ligero de 135 M de parametros, puede desplegarse en el servidor de una aplicacion para preclasificar mensajes antes de entregarlos al usuario.
- Prototipo de alerta temprana para campanas de fraude: las operadoras pueden monitorizar volumenes de mensajes clasificados como smishing para detectar campanas activas y emitir avisos a sus clientes.
- Investigacion academica sobre phishing SMS multilingue: el modelo sirve como punto de partida para estudios comparativos sobre deteccion de fraude en arabe dialectal y Arabizi, donde los sistemas comerciales suelen fallar.
- Componente de clasificacion en un pipeline RAG: el proyecto AmanLeb integra este modelo junto con recuperacion aumentada para contextualizar mensajes sospechosos con informacion de fuentes externas.
- Analisis retrospectivo de corpus de SMS: permite etiquetar grandes volumenes de mensajes historicos para construir conjuntos de datos etiquetados o auditar la exposicion de una poblacion a campanas de smishing.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de prueba retenido:

| Metrica | Valor |
|---|---|
| Precision (accuracy) | 97,3 % |
| F1 macro | 0,905 |
| Mensajes sospechosos predichos como ham | 2 |
| Mensajes smishing predichos como ham | 0 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor senala que el resultado de cero smishing clasificados como ham solo aplica al conjunto de prueba retenido y no constituye una garantia para mensajes reales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 540 MB en FP32 y 270 MB en FP16, mas overhead de activaciones. Cabe en cualquier GPU consumer con 4 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090) o incluso inferencia en CPU con un rendimiento aceptable dado el tamano del modelo.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, TensorFlow Serving, o bien exportacion a formato TorchScript. Al ser un modelo de clasificacion pequeno, tambien es viable en entornos serverless o en dispositivos de borde.
- Latencia: no se dispone de mediciones publicadas. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por lote en GPU y de decenas de milisegundos en CPU para secuencias cortas de SMS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (SMS) | Licencia |
|---|---|---|---|---|
| AmanLeb (este modelo) | 135,3 M | 512 tokens | 97,3 % (test propio) | no disponible |
| distilbert-base-multilingual-cased (base) | 134,7 M | 512 tokens | no aplica (sin fine-tuning) | Apache 2.0 |
| bert-base-multilingual-cased (mBERT) | 178,2 M | 512 tokens | no disponible | Apache 2.0 |
| XLM-RoBERTa-base | 278,3 M | 512 tokens | no disponible | MIT |

No se dispone de datos de benchmarks comparativos de otros clasificadores de spam SMS sobre el mismo conjunto de datos, por lo que no es posible establecer una comparacion directa de rendimiento.

## Limitaciones y advertencias

- El modelo se entreno con un conjunto de datos pequeno de phishing por SMS y no debe utilizarse como sistema antifraude de produccion.
- El rendimiento puede degradarse ante patrones de fraude no vistos, arabe dialectal, variaciones de Arabizi, nuevas organizaciones o marcas, mensajes adversariales y cambios de distribucion.
- El resultado de cero smishing clasificados como ham solo aplica al conjunto de prueba retenido y no es una garantia para mensajes reales.
- La licencia no esta especificada en la ficha de Hugging Face, por lo que se desconoce si el uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en entornos de produccion.
- No se dispone de informacion sobre sesgos especificos del modelo, aunque al estar entrenado sobre un corpus pequeno y geograficamente acotado a Libano, es probable que su rendimiento fuera de ese contexto se vea reducido.
- La fecha de creacion del repositorio (15 de agosto de 2026) y el numero de descargas (0) sugieren que el modelo es reciente y no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammadNaim3/AmanLeb
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Repositorio GitHub del proyecto AmanLeb: mencionado en la model card, pero no se proporciona la URL en la informacion disponible.
