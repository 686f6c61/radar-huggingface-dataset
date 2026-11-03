# Itan-levin/sapset-adapters

## Resumen

SAPset adapters es una colección de 100 adaptadores LoRA publicados por Itan-levin para el transformer de difusión de formas (shape DiT) de Hunyuan3D 2.1, el modelo de generación 3D de Tencent. Cada adaptador está entrenado para personalizar el generador sobre un único objeto de origen del benchmark Edit3D-Bench, de modo que el modelo aprenda a regenerar ese objeto concreto a partir de ruido. La edición se consigue aplicando el adaptador con una intensidad distinta por cada token latente, técnica que da nombre al proyecto (SAPset).

El repositorio no contiene un modelo generativo autónomo, sino pesos PEFT (LoRA de rango 16 y alpha 16) que se cargan sobre el checkpoint base de Hunyuan3D 2.1. Su relevancia es metodológica: demuestra un enfoque de edición 3D por personalización por objeto en lugar de por instrucciones textuales, y publica los adaptadores junto a un manifiesto con el paso de entrenamiento seleccionado y la distancia Chamfer de validación de cada uno.

El tamaño del repositorio es de 4,5 GB, lo que refleja los 100 adaptadores más el manifiesto. No se proporcionan datos sobre licencia, idiomas ni pipeline de HuggingFace, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el shape DiT de Hunyuan3D 2.1 (transformer de difusión con capas mixture-of-experts) |
| Parametros totales | no disponible (100 adaptadores LoRA de rango 16; el recuento agregado no se publica) |
| Parametros activos | no disponible (el modelo base Hunyuan3D 2.1 emplea capas MoE, pero no se detalla el reparto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

Los adaptadores se aplican sobre el transformer de difusión de formas de Hunyuan3D 2.1. Según la model card, los módulos objetivo son las capas feed-forward, incluidas las que están dentro de las capas mixture-of-experts (`fc1`, `fc2`, `net.0.proj`, `net.2`). El rango y el alpha de LoRA son ambos 16. Los pesos base permanecen congelados durante el entrenamiento y el objetivo es flow matching.

Cada uno de los 100 adaptadores se entrena sobre un único objeto de origen de Edit3D-Bench con 266 renders por objeto: 16 vistas fijas de estilo benchmark y 250 cámaras aleatorias bajo iluminación aleatorizada, emparejadas con latentes codificados a partir de puntos muestreados sobre la superficie del objeto. Para cada objeto se selecciona el checkpoint con la menor distancia Chamfer de validación, dato que queda registrado en `manifest.json` junto al paso de entrenamiento elegido. La innovación destacable es el mecanismo de edición: en lugar de condicionar por texto, se aplica el adaptador con una fuerza diferente por token latente, lo que permite editar el objeto regenerado.

## Capacidades

- Personalización de la generación 3D sobre un objeto concreto: cada adaptador permite regenerar su objeto de origen a partir de ruido.
- Edición 3D por intensidad variable por token latente (mecanismo SAPset), aplicable a los 12 casos de edición de objeto completo de Edit3D-Bench.
- Integración con el pipeline de Hunyuan3D 2.1 para generación de formas 3D.
- Carga estándar vía PEFT, con `adapter_config.json` y `adapter_model.safetensors` por carpeta.
- Selección programática de adaptadores por objeto mediante `manifest.json`.
- No se documentan capacidades de texto, código, matemáticas, visión 2D, tool calling, agentes ni multilingüismo.

## Casos de uso

- Edición 3D controlada en investigación: aplicar el adaptador del objeto con distinta fuerza por token latente para modificar regiones concretas de la malla, usando el repositorio SAPset y los casos de Edit3D-Bench como banco de pruebas reproducible.
- Evaluación de métodos de edición 3D: los 100 adaptadores y el manifiesto con distancias Chamfer permiten comparar técnicas de edición contra una línea base por objeto con métricas de validación ya registradas.
- Prototipado de personalización por activo: entrenar o reutilizar un adaptador por objeto para regenerar un activo 3D concreto de forma consistente, útil en flujos de diseño iterativo donde se parte siempre del mismo modelo de origen.
- Reproducción de experimentos: el script `download_adapters.py` y el comando `sapset-edit` permiten descargar los adaptadores por objeto y reproducir casos concretos del benchmark sin reentrenar.
- Estudio de LoRA en difusión 3D: la configuración concreta (rango 16, alpha 16, capas FFN dentro de MoE) sirve como referencia para experimentos de adaptación de bajo rango sobre DiT 3D.
- Docencia y divulgación: el par adaptadores + benchmark facilita demostrar la diferencia entre edición por instrucciones y edición por personalización por objeto en generación 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta, por objeto, la distancia Chamfer de validación del checkpoint seleccionado, registrada en `manifest.json`, sin tabla comparativa agregada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del checkpoint base Hunyuan3D 2.1 y de su precisión de carga, no de los adaptadores LoRA, que añaden una sobrecarga pequeña.
- GPU recomendadas: no disponible en la información proporcionada; el requisito dominante es el del modelo base Hunyuan3D 2.1.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: el flujo documentado usa el repositorio SAPset (`scripts/download_adapters.py` y el comando `sapset-edit`) junto con la librería PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAPset adapters (este) | LoRA sobre Hunyuan3D 2.1 | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Hunyuan3D 2.1 (base) | Shape DiT con MoE | no disponible | no disponible | no disponible | HuggingFace (tencent/Hunyuan3D-2.1) |
| Alternativas de edición 3D por instrucciones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base tencent/Hunyuan3D-2.1 y el código del repositorio SAPset para funcionar.
- Especialización extrema: cada adaptador está entrenado para un único objeto de Edit3D-Bench; no generaliza a objetos arbitrarios.
- Licencia no especificada: no se indica licencia del repositorio, por lo que el uso comercial no está claramente autorizado y debe verificarse con el autor y con la licencia del modelo base.
- Datos de entrenamiento sintéticos: 266 renders por objeto con cámaras e iluminación aleatorizadas, lo que puede introducir sesgos hacia esas condiciones de render.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, al no tratarse de un modelo de lenguaje.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La cita académica está pendiente ("To be added"), lo que dificulta la trazabilidad del método.
- Los 12 casos de edición de objeto completo se alojan en un dataset aparte (Itan-levin/sapset-global-edits), no en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Itan-levin/sapset-adapters
- Modelo base: https://huggingface.co/tencent/Hunyuan3D-2.1
- Repositorio de código SAPset: https://github.com/itan-levin/sapset
- Dataset de ediciones de objeto completo: https://huggingface.co/datasets/Itan-levin/sapset-global-edits
