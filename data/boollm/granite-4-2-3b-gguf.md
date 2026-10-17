# Boollm/Granite-4.2-3B-GGUF

## Resumen

Boollm Granite 4.2 3B v1 es un ajuste fino del modelo IBM Granite 4.2 3B, desarrollado por Boollm a partir de la revision `e459acceac81e5fe67c07d9cfc72329a332e7eb1` del repositorio `ibm-granite/granite-4.2-3b`. El resultado se ha fusionado y empaquetado como un GGUF autonomo cuantizado en Q5_K_M, de aproximadamente 2,61 GB, pensado para ejecutarse en entornos locales con llama.cpp. Segun la propia model card, no se trata de un lanzamiento respaldado por IBM: IBM desarrollo el modelo base y Boollm realizo el ajuste y el empaquetado.

El modelo cuenta con 3.659.737.600 parametros, esta orientado a generacion de texto y cubre 36 grupos funcionales de Boollm (conversacion, redaccion, resumenes de documentos, razonamiento sobre texto OCR o adjuntos, investigacion sobre fuentes proporcionadas, respuestas de codigo y borradores de acciones con confirmacion). El ajuste se hizo con MLX LoRA sobre 8.892 ejemplos de entrenamiento y 350 de validacion, con un limite de secuencia de 3.072 tokens durante el entrenamiento.

Es relevante ahora porque permite desplegar de forma local un asistente de ~3,6B parametros con licencia Apache 2.0 y un unico fichero GGUF, sin necesidad de descargar el modelo base ni adaptadores LoRA por separado. Conviene advertir, no obstante, que se trata de una publicacion reciente con 0 descargas y 0 likes, y que la propia model card reconoce que varias capacidades dependen de la aplicacion anfitriona y no del modelo por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de IBM Granite 4.2 3B; arquitectura base no especificada en la informacion) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (entrenamiento limitado a 3.072 tokens; pruebas en tiempo de ejecucion a 4.096 tokens; el contexto maximo del base no se especifica) |
| Tipos de cuantizacion | Q5_K_M (GGUF); se menciona una exportacion Q4_K_M previa que fue rechazada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q5_K_M), distribuido dentro de un ZIP con tokenizer, configuracion, licencia, sumas de comprobacion y registros de evaluacion |

## Arquitectura y entrenamiento

El modelo base es IBM Granite 4.2 3B, sobre el que Boollm aplico un ajuste fino con MLX LoRA. Los detalles de arquitectura del base (tipo de transformer, atencion, etc.) no se especifican en la informacion proporcionada. El proceso de ajuste utilizo 8.892 iteraciones configuradas, batch size 1, acumulacion de gradiente 4, perdida solo sobre el turno del asistente (
