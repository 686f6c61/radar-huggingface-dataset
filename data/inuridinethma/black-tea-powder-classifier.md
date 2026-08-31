# InuriDinethma/black-tea-powder-classifier

## Resumen

El modelo **Black Tea Powder Classifier** es un clasificador de imágenes desarrollado por InuriDinethma para identificar distintos grados comerciales de té negro en polvo a partir de fotografías. Está construido sobre una arquitectura EfficientNetV2S y entrenado con el framework Keras, y se distribuye como una aplicación Gradio alojada en Hugging Face Spaces.

El problema que resuelve es la clasificación visual de nueve categorías de té negro (BM, BOP, BP, BROKEN_TEA, DUST, FANNING_2, PF, PW_DUST y NOT_TEA), donde esta última clase actúa como mecanismo de rechazo de muestras que no pertenecen al dominio. Esta capacidad de rechazo de clase abierta (open-set rejection) es relevante para aplicaciones de control de calidad en la industria del té, donde los operarios necesitan distinguir entre grados válidos y materiales no conformes.

El modelo se entrenó con un tamaño de imagen de 384 píxeles, un recorte central del 68% y aumentación de datos de diez recortes en inferencia (ten-crop test-time augmentation). Su relevancia actual radica en que aborda un caso de uso industrial específico con una arquitectura eficiente y un mecanismo de rechazo integrado, lo que lo hace adecuado para entornos de producción donde la precisión y la robustez ante entradas fuera de distribución son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2S |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | Keras (.keras) |

## Arquitectura y entrenamiento

El modelo utiliza EfficientNetV2S, una arquitectura convolutional escalable de la familia EfficientNetV2 que combina bloques MBConv con Fused-MBConv y se optimiza mediante un entrenamiento progresivo que ajusta el tamaño de imagen y la regularización durante el proceso. La variante S (small) es la más ligera de la familia, diseñada para equilibrar precisión y eficiencia computacional, lo que la hace adecuada para despliegue en entornos con recursos limitados.

El entrenamiento se realizó con imágenes de entrada de 384x384 píxeles, aplicando un recorte central del 68% de la imagen original. La aumentación en inferencia incluye ten-crop test-time augmentation, que genera diez recortes distintos (cuatro esquinas, centro y sus espejos horizontales) para promediar las predicciones y mejorar la robustez. El modelo clasifica en nueve categorías: ocho grados de té (BM, BOP, BP, BROKEN_TEA, DUST, FANNING_2, PF, PW_DUST) y una clase NOT_TEA para rechazo de muestras fuera de dominio.

No se dispone de información sobre el número de épocas, el tamaño del dataset de entrenamiento, la composición de los datos ni si se aplicaron técnicas como fine-tuning desde pesos preentrenados de ImageNet. El nombre del archivo del modelo (`black_tea_efficientnetv2s_crop068_best.keras`) sugiere que se seleccionó el mejor checkpoint según alguna métrica de validación, probablemente precisión o F1.

## Capacidades

- Clasificacion de imagenes de polvo de te negro en ocho grados comerciales distintos.
- Rechazo de muestras fuera de dominio mediante la clase NOT_TEA, lo que permite detectar imagenes que no corresponden a polvo de te negro.
- Salida de probabilidades por clase, lo que permite interpretar la confianza del modelo en cada prediccion.
- Inferencia con aumentacion ten-crop para mejorar la robustez ante variaciones de iluminacion, escala y encuadre.
- Despliegue como aplicacion Gradio interactiva, permitiendo la carga de imagenes y visualizacion de resultados en un navegador.
- Preprocesamiento configurable mediante un archivo JSON, lo que facilita la reproduccion del pipeline de inferencia.

## Casos de uso

- Control de calidad en plantas de procesamiento de te: el modelo puede integrarse en una linea de inspeccion visual para clasificar automaticamente lotes de polvo de te negro segun su grado, reduciendo la dependencia de evaluadores humanos y acelerando el proceso de certificacion.
- Verificacion de proveedores: importadores y distribuidores pueden usar la aplicacion para verificar que las muestras recibidas de distintos proveedores corresponden al grado declarado en la factura, detectando posibles fraudes o errores de etiquetado.
- Clasificacion en investigacion agronomica: investigadores que estudian la correlacion entre condiciones de cultivo y calidad del te pueden usar el modelo para estandarizar la clasificacion de muestras en sus experimentos, garantizando consistencia entre lotes.
- Deteccion de contaminacion: la clase NOT_TEA permite identificar imagenes de materiales extranos (hojas, polvo de otro origen, impurezas) que puedan haber contaminado una muestra, actuando como un filtro de seguridad en el proceso de analisis.
- Formacion de personal: la aplicacion Gradio puede usarse como herramienta didactica para formar a nuevos catadores o personal de calidad en la identificacion visual de los distintos grados de polvo de te negro, mostrando las probabilidades asignadas a cada clase.
- Auditoria de procesos de exportacion: organismos reguladores o empresas certificadoras pueden emplear el modelo como apoyo en la verificacion de que los cargamentos de te negro cumplen con los grados declarados en la documentacion aduanera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como precision, recall, F1 o exactitud sobre conjuntos de validacion o test, ni comparaciones con otros clasificadores de te.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un EfficientNetV2S con entrada de 384x384, se estima que la inferencia requiere entre 1 y 2 GB de VRAM en FP32, y menos de 1 GB con cuantizacion a FP16 o INT8.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores pueden ejecutar la inferencia sin problemas. Tambien es viable en Apple Silicon (M1/M2) mediante Metal.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU consumer actual, incluidas las integradas de gama alta.
- Opciones de despliegue: la aplicacion Gradio puede ejecutarse localmente con Python y las dependencias de `requirements.txt`. Tambien puede desplegarse en Hugging Face Spaces con GPU o CPU. Para integracion en produccion, el modelo Keras puede exportarse a TensorFlow SavedModel o TFLite para inferencia en servidores o dispositivos edge.
- Latencia y throughput estimados: no disponible. Al ser un modelo de tamano pequeno, se espera una latencia de decenas de milisegundos por imagen en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente disenados para clasificacion de polvo de te negro con las mismas clases y mecanismo de rechazo. Los trabajos encontrados en la busqueda web abordan la clasificacion de te mediante espectroscopia NIRS o imagenes hiperespectrales, que son metodologias diferentes a la clasificacion visual con redes convolucionales. Por tanto, no es posible establecer una comparativa directa con alternativas equivalentes sin inventar datos.

## Limitaciones y advertencias

- El modelo solo clasifica ocho grados de polvo de te negro mas una clase de rechazo; no es aplicable a otros tipos de te (verde, oolong, blanco) ni a hojas enteras de te.
- La clase NOT_TEA solo rechaza muestras que el modelo ha aprendido a reconocer como fuera de dominio; muestras muy similares a polvo de te negro (por ejemplo, polvo de cafe o cacao) podrian clasificarse erroneamente como un grado valido.
- No se dispone de informacion sobre la licencia del modelo, por lo que su uso comercial podria estar restringido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- No se han publicado metricas de rendimiento, por lo que se desconoce la precision real del modelo en condiciones de campo.
- El entrenamiento con recorte central del 68% implica que el modelo espera imagenes donde el polvo de te ocupa la mayor parte del encuadre; imagenes con fondos muy variados o el producto en pequena proporcion pueden degradar la precision.
- La aplicacion Gradio depende de la disponibilidad de los ficheros del modelo en el Space de Hugging Face; si estos se eliminan o modifican, la aplicacion podria dejar de funcionar.
- No se indica si el modelo es robusto ante variaciones de iluminacion, angulo de camara o resolucion de imagen; se recomienda validar con un conjunto propio de imagenes antes de un despliegue en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/InuriDinethma/black-tea-powder-classifier
- Aplicacion Gradio asociada: https://huggingface.co/spaces/manika123456789/black-tea-powder-classifier
- Articulo sobre monitorizacion de dinamica fitoquimica en procesamiento de te negro: https://www.sciencedirect.com/science/article/pii/S0169743925002965
- Metodo de clasificacion de te basado en espectroscopia NIRS: https://www.sciencedirect.com/science/article/pii/S1350449525000064
- Patente de clasificador de te negro: https://patents.google.com/patent/CN203105496U/en
- Articulo sobre clasificacion no destructiva de grados de te negro: https://xplorestaging.ieee.org/document/10914619/
