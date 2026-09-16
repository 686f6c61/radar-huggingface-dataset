# ertoluk/ai-metin-dedektor-en

## Resumen

El modelo `ertoluk/ai-metin-dedektor-en` es un clasificador binario de texto disenado para determinar si un texto en ingles ha sido escrito por un ser humano (clase 0) o generado por inteligencia artificial (clase 1). Lo desarrolla el usuario de HuggingFace ertoluk y esta construido sobre `roberta-base`, con 124.647.170 parametros totales en formato safetensors. Su tarea principal es la deteccion de contenido sintetico, un problema cada vez mas relevante para medios de comunicacion, plataformas educativas y equipos de moderacion que necesitan senalar texto generado automaticamente.

El modelo se publica bajo licencia Apache 2.0, con un pipeline declarado de `text-classification` y soporte unicamente para ingles. Su arquitectura es la de un transformer encoder de tipo RoBERTa, por lo que hereda las caracteristicas de la familia: bidireccionalidad completa y una ventana de contexto de 512 tokens. La model card esta redactada en turco (el autor lo denomina "AI Metin Dedektörü — İngilizce") y aporta metricas internas muy altas sobre un conjunto de test propio de 800 ejemplos.

Su interes practico reside en que no solo devuelve una probabilidad, sino que propone tres bandas de decision (humano, zona intermedia con revision humana obligatoria, IA) que permiten integrarlo en flujos donde el falso positivo tiene un coste alto. El autor declara explicitamente que la herramienta no constituye una prueba y que no es fiable con textos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (RoBERTa, base) |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (maximo de `roberta-base`; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `text-classification` |
| Clases | 0 = humano, 1 = IA |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa en configuracion base, afinado para clasificacion binaria de secuencia. La model card no detalla hiperparametros de ajuste, numero de tokens de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; un clasificador de este tipo se entrena habitualmente con aprendizaje supervisado sobre pares (texto, etiqueta), pero ese detalle no se confirma en la informacion disponible. En la cabeza de clasificacion se obtiene una puntuacion que se interpreta como probabilidad de que el texto sea de origen humano o artificial.

Los datos de entrenamiento declarados son el corpus HC3 (respuestas humanas y de ChatGPT procedentes de Reddit y de los dominios de finanzas, medicina, derecho y enciclopedia) combinados con textos de archivo periodistico. El autor senala que en una primera ronda de entrenamiento con un unico dominio el modelo aprendia a distinguir "que tipo de texto es" en lugar de "si es IA", y que la incorporacion de multiples dominios tuvo como objetivo corregir ese atajo. No se mencionan innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal; se trata por tanto de un ajuste fino convencional sobre un encoder preentrenado.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve una etiqueta (humano / IA) y una puntuacion asociada.
- Deteccion de texto generado por IA en dominios diversos: redes sociales (Reddit), finanzas, medicina, derecho, textos enciclopedicos y periodismo.
- Umbrales de decision en tres bandas: por debajo de 0,450 se clasifica como humano; entre 0,450 y 0,550 se considera zona intermedia que requiere revision humana; por encima de 0,550 se clasifica como IA.
- Integracion como componente de filtrado en pipelines de moderacion o verificacion, dado que se expone como tarea `text-classification` estandar.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking). Es exclusivamente un clasificador.
- Multilingue: no. Solo ingles.

## Casos de uso

- Moderacion de foros y comunidades: el modelo puede puntuar cada publicacion entrante y marcar automaticamente aquellas con score superior a 0,550 como posible contenido generado por IA, derivando las que caigan en la banda 0,450-0,550 a revision humana para evitar sanciones injustas.
- Verificacion editorial en medios de comunicacion: ante la recepcion de articulos de colaboradores externos, el clasificador permite un primer cribado del texto completo (hasta 512 tokens por fragmento) para detectar piezas sospechosas antes de la edicion.
- Deteccion de respuestas generadas en plataformas educativas: en la correccion de ensayos en ingles, el score puede utilizarse como senal de alerta que active una revision manual adicional, nunca como decision automatica, dado que el autor advierte de que no es una herramienta de prueba.
- Auditoria de contenido en agregadores de noticias: el modelo se puede ejecutar por lotes sobre el archivo historico para estimar la proporcion de contenido sintetico en un dominio concreto, aprovechando el entrenamiento multi-dominio con textos periodisticos.
- Filtrado previo en la construccion de datasets: al recopilar corpus en ingles para entrenar otros modelos, el clasificador sirve para descartar ejemplos generados por IA y preservar la proporcion de texto humano.
- Investigacion sobre deteccion de texto sintetico: al estar bajo Apache 2.0 y ser un modelo de 125 M de parametros, es util como linea base reproducible frente a la que comparar detectores propios, y como punto de partida para ajuste adicional en dominios especificos.
- Control de calidad en generacion de contenido asistida: en redacciones que declaran el uso de IA, el modelo permite verificar que las secciones etiquetadas como humanas no contienen texto generado, siempre con el aval de una revision adicional.

## Benchmarks y rendimiento

El autor publica un unico conjunto de mediciones sobre su propio conjunto de test de 800 ejemplos. No se aportan resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un clasificador.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| AUC | 1,000 | Test propio, 800 ejemplos |
| Tasa de falsa acusacion (marcar como IA un texto humano) | 0,2 % | Test propio, 800 ejemplos |
| Tasa de omision (no detectar un texto de IA) | 0,3 % | Test propio, 800 ejemplos |
| F1 del modelo base | 0,965 | Test propio, 800 ejemplos |

No se han publicado resultados de benchmarks independientes ni de terceros en la informacion disponible. Un AUC de 1,000 sobre un test propio de 800 ejemplos debe interpretarse con cautela: es un resultado muy alto que sugiere posible solapamiento entre los datos de entrenamiento y de evaluacion, y no ha sido replicado externamente.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB (unos 500 MB para 124,6 M de parametros); en FP16, aproximadamente 0,25 GB. La huella real dependera del framework y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. No se requiere A100, H100 ni hardware de centro de datos; tarjetas consumer como GTX 1650, RTX 3060, RTX 4090 o incluso integradas modernas pueden ejecutarlo sin problema.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso puede ejecutarse en CPU con latencia aceptable para lotes pequenos.
- Opciones de despliegue: al ser un modelo de transformers compatible con `AutoModelForSequenceClassification`, puede servirse con HuggingFace Transformers, Text Generation Inference (TGI) para clasificacion, o exportarse a ONNX. No se han publicado conversiones a GGUF ni recetas especificas para Ollama o llama.cpp.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento, parametros o caracteristicas de modelos alternativos de deteccion de texto generado (por ejemplo, detectores basados en RoBERTa, DeBERTa o clasificadores comerciales). Por tanto, la comparativa cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `ertoluk/ai-metin-dedektor-en` | 124,6 M | 512 tokens | Apache 2.0 | AUC 1,000 y F1 base 0,965 en test propio de 800 ejemplos | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es fiable con textos cortos: el propio autor lo indica de forma explicita. Para entradas breves (titulares, mensajes de una linea) el score debe descartarse.
- Puede omitir texto de IA que haya sido reescrito o parafraseado: la deteccion se degrada cuando el contenido sintetico pasa por procesos de reescritura humana o de parafraseo adicional.
- No es una herramienta probatoria: la model card advierte literalmente de que "no es una herramienta de evidencia". No debe usarse para acusar a una persona de usar IA sin revision humana y contexto adicional.
- Sesgos de dominio: el entrenamiento se apoya en HC3 (Reddit, finanzas, medicina, derecho, enciclopedia) y en textos de archivo periodistico. El rendimiento fuera de esos dominios (ficcion, poesia, texto tecnico muy especializado, jerga) es desconocido.
- Limitacion idiomatica: solo ingles. Cualquier uso en castellano u otro idioma queda fuera del alcance declarado y no esta validado.
- Limitacion de contexto: la ventana de 512 tokens obliga a fragmentar documentos largos, lo que puede alterar la senal de deteccion en cada fragmento.
- Validez no replicada: las metricas (AUC 1,000) proceden de un test propio de 800 ejemplos no auditado externamente. No deben extrapolarse a produccion sin una evaluacion propia sobre datos representativos del caso de uso.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe comunidad que haya verificado su comportamiento ni reportado fallos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre citando la licencia y sin garantias por parte del autor.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ertoluk/ai-metin-dedektor-en
- Dataset HC3 (mencionado como fuente de entrenamiento): no disponible enlace especifico en la informacion proporcionada
- Paper o publicacion tecnica del autor: no disponible
- Repositorio de codigo o demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con este modelo (corresponden a articulos en ruso sobre interpretacion de analisis de sangre), por lo que no se incluye ningun enlace adicional.
