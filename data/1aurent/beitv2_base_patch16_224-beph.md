# 1aurent/beitv2_base_patch16_224.beph

## Resumen

BEiT v2 base patch16 224 (BEPH) es un backbone de extraccion de caracteristicas visuales derivado de BEiT v2, un transformer de vision (ViT-Base) preentrenado con modelado de imagenes enmascaradas (MIM) auto-supervisado. En esta variante concreta, el checkpoint ha sido adaptado por el autor Zhaochang Yang y su equipo como modelo fundacional para diagnostico de cancer y prediccion de supervivencia a partir de imagenes histopatologicas, publicado en Nature Communications en 2025. El repositorio de Hugging Face lo reempaqueta en formato timm manteniendo paridad numerica con el checkpoint original.

El modelo tiene 85,8 millones de parametros, procesa imagenes de 224x224x3 con parches de 16x16 y produce embeddings de 768 dimensiones. Su relevancia radica en que aplica un backbone de vision de proposito general al dominio biomedico de patologia computacional, un area donde los modelos especificos de dominio suelen requerir grandes volumenes de datos anotados.

La ficha tecnica se centra en su uso como extractor de caracteristicas para pipelines de analisis de imagenes de patologia de campo completo (WSI), no como modelo generativo ni conversacional. No dispone de capacidades de texto, razonamiento linguistico ni tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Base (BEiT v2, MIM auto-supervisado), bias relativo de posicion compartido, sin pos-embed absoluto, sin registros |
| Parametros totales | 85.761.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224x224x3, parche 16x16x3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades linguisticas) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (formato timm); checkpoint original .pth en Google Drive |

## Arquitectura y entrenamiento

Se trata de un transformer de vision con arquitectura ViT-Base: 12 bloques, dimension de embedding 768, atencion multi-cabeza y parches de 16x16 sobre entradas de 224x224. Usa bias relativo de posicion compartido (la tabla se despliega por bloque segun la convencion de timm), no emplea embeddings posicionales absolutos ni tokens de registro. La normalizacion final (`fc_norm`) se inicializa como identidad porque el preentrenamiento original usa `final_norm=False`.

El preentrenamiento es auto-supervisado mediante modelado de imagenes enmascaradas (MIM), la base de BEiT v2. El ajuste especifico para patologia (BEPH) se describe en el articulo de Yang et al. (Nature Communications, 2025), que entrena el backbone sobre imagenes histopatologicas para tareas de diagnostico de cancer y prediccion de supervivencia. El repositorio documenta una verificacion de paridad bit a bit con el checkpoint original: 183 de 184 tensores identicos y paridad capa a capa a 224x224 (diferencia maxima 0,0, coseno 1,0). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Extraccion de caracteristicas visuales: genera embeddings de 768 dimensiones por imagen de 224x224.
- Clasificacion de imagenes: etiquetado de imagenes histopatologicas (cancer, tejido, subtipos tumorales).
- Analisis de imagenes de patologia de campo completo (WSI) mediante extraccion de caracteristicas por parche, tipicamente integrada en pipelines tipo CLAM.
- Prediccion de supervivencia a partir de caracteristicas histopatologicas (segun el articulo asociado).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (modelo puramente visual).
- Sin modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Extraccion de caracteristicas de WSI para diagnostico asistido: el modelo procesa cada parche de 224x224 de una laminilla y produce embeddings de 768 dimensiones que alimentan clasificadores posteriores de tejido tumoral. Adecuado por su preentrenamiento especifico en histologia.
- Prediccion de supervivencia en cancer: los embeddings agregados por paciente sirven de entrada a modelos de supervivencia, aprovechando el ajuste del backbone sobre datos de patologia.
- Clasificacion de subtipos tumorales: uso como extractor congelado y entrenamiento de una cabeza lineal o MLP ligera sobre las caracteristicas, reduciendo el coste de anotacion.
- Recuperacion de imagenes similares (image retrieval): comparar embeddings de parches para buscar regiones morfologicamente parecidas en archivos histopatologicos.
- Control de calidad y triaje de laminillas: detectar parches con tejido relevante frente a fondo o artefactos antes de pasarlos a un patologo o a un modelo mayor.
- Investigacion traslacional: generacion de representaciones para estudios de asociacion entre morfologia y variables clinicas, con inferencia barata en GPU de consumo.
- Preentrenamiento inicial para tareas de patologia con pocos datos: usar el backbone como inicializacion en lugar de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB de pesos (85,8 M parametros), mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- En FP16/BF16 los pesos ocupan aproximadamente 0,17 GB.
- GPU recomendadas: cualquier GPU moderna; desde RTX 3060/4090 hasta A100/H100. Para procesar WSI completas conviene una GPU con al menos 8-16 GB para lotes grandes de parches.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: timm con PyTorch (ruta documentada), exportacion a ONNX/TorchScript no documentada pero viable; no se documentan integraciones con vLLM, llama.cpp ni Ollama (no aplica a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un ViT-Base de 224x224, el coste por imagen es bajo y permite procesar miles de parches por minuto en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beitv2_base_patch16_224.beph | 85,8 M | 224x224, parche 16 | Extraccion de caracteristicas en histopatologia | GPL-3.0 | Hugging Face (timm) |
| BEiT v2 base (original) | ~86 M | 224x224, parche 16 | Vision general (ImageNet) | MIT (upstream, segun repositorio original) | Hugging Face / timm |
| ViT-Base (ImageNet) | ~86 M | 224x224, parche 16 | Vision general | Apache-2.0 / MIT segun variante | Amplia |
| Otros backbones de patologia (p. ej. CTransPath, UNI) | no disponible | variable | Histopatologia | variable | Hugging Face / repos |

La comparativa concreta de rendimiento frente a estos modelos no esta disponible en la informacion proporcionada; no se aportan numeros de benchmarks.

## Limitaciones y advertencias

- Modelo puramente visual: no genera texto, no razona en lenguaje natural y no soporta conversacion ni tool calling.
- Entrenado y ajustado para histopatologia; su uso fuera de ese dominio no esta validado y puede degradarse.
- Riesgo de sesgo de dominio: el rendimiento puede variar segun el escaner, la tincion (H&E frente a otras) y la cohorte de origen de las imagenes.
- Riesgo de falsos negativos y positivos en diagnostico: no debe usarse como sustituto del criterio medico; requiere validacion clinica.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; revisar antes de uso comercial.
- El repositorio no documenta cuantizaciones ni formatos alternativos a safetensors/timm.
- La fecha de creacion del repositorio (2026-11-25) y el escaso numero de descargas y likes indican baja adopcion y validacion externa limitada.
- El checkpoint original se distribuye por Google Drive; el reempaquetado en timm requiere usar los argumentos de creacion documentados (`use_abs_pos_emb=False`, `use_rel_pos_bias=True`, `init_values=0.1`, `num_classes=0`).

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/beitv2_base_patch16_224.beph
- Articulo (Nature Communications): https://doi.org/10.1038/s41467-025-57587-y
- Repositorio del proyecto BEPH: https://github.com/Zhcyoung/BEPH
- Pesos originales (Google Drive): https://drive.google.com/file/d/19Fu3dw3G4i2gPXijzrxfaQ2D_xcqNdNz/view?usp=sharing
