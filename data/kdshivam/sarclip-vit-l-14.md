# kdshivam/SARCLIP-ViT-L-14

## Resumen

SARCLIP es un modelo fundacional multimodal diseñado específicamente para imágenes de radar de apertura sintética (SAR), desarrollado por el equipo CAESAR-Radi. Se basa en el marco CLIP (Contrastive Language-Image Pre-training) y permite establecer una correspondencia cruzada entre imágenes SAR y descripciones textuales, habilitando tareas como clasificación zero-shot, recuperación cross-modal e inferencia imagen-texto.

El modelo resulta relevante porque aborda un dominio muy especializado —la teledetección por radar— donde los modelos preentrenados en imágenes ópticas naturales (como CLIP original) suelen fallar debido a la naturaleza radicalmente distinta de las imágenes SAR (textura speckle, geometría de retrodispersión, ausencia de color). SARCLIP se publica con licencia MIT para el código y con restricciones no comerciales para el dataset asociado (SARCAP).

La variante aquí descrita, SARCLIP-ViT-L-14, utiliza una arquitectura ViT-L-14 con 427,6 millones de parámetros, compatible con el ecosistema OpenCLIP. Está publicada en formato safetensors y es compatible con herramientas de inferencia estándar del ecosistema CLIP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L-14 (CLIP) |
| Parametros totales | 427.616.512 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo visual-textual, sin ventana de contexto textual explicita) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (codigo); dataset SARCAP con licencia separada no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SARCLIP sigue la arquitectura CLIP clasica: un codificador de imagenes basado en vision transformer (ViT-L-14) y un codificador de texto basado en transformer, entrenados conjuntamente con un objetivo de contraste entre pares imagen-texto. La variante ViT-L-14 usa parches de 14x14 pixeles y 24 capas de transformer, siendo la configuracion de mayor capacidad dentro de la familia SARCLIP publicada.

El entrenamiento se realizo sobre el dataset SARCAP, compuesto por pares imagen-texto de imagenes SAR con captions descriptivos, complementado con datos de fuentes como Capella Space, ESA Copernicus WorldCover, OGSOD, RSDD, SADD, SIVED y SEN12MS. El modelo se basa en el codigo de OpenCLIP, por lo que el procedimiento de entrenamiento sigue el pipeline estandar de contraste CLIP con aumento de datos especifico para SAR. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente contrastivo.

## Capacidades

- Clasificacion zero-shot de imagenes SAR: el modelo puede clasificar parches de radar en categorias como zonas urbanas, areas de agua, tierras de cultivo, etc., sin necesidad de fine-tuning.
- Recuperacion cross-modal: permite buscar imagenes SAR a partir de descripciones textuales y viceversa (dado un caption, recuperar la imagen correspondiente).
- Inferencia imagen-texto: dado un conjunto de imagenes SAR, el modelo genera predicciones textuales con puntuaciones de similitud.
- Generacion de embeddings multimodales: produce representaciones vectoriales alineadas entre el espacio visual SAR y el espacio textual, utiles para tareas downstream como clustering o visualizacion t-SNE.
- Soporte de fine-tuning: al estar basado en OpenCLIP, los pesos pueden ajustarse para datasets SAR especificos.
- Capacidades multilingues: no disponible; el modelo esta entrenado solo con captions en ingles.

## Casos de uso

- Clasificacion automatica de cobertura terrestre en imagenes SAR: el modelo puede etiquetar parcelas de radar en categorias como urbano, agua o cultivos, facilitando la monitorizacion del territorio sin necesidad de datasets etiquetados manualmente para cada nueva region.
- Recuperacion de imagenes SAR por descripcion textual: un analista puede buscar "barcos en la costa" o "tanques de almacenamiento" en un archivo historico de imagenes SAR sin conocer las coordenadas exactas, agilizando la inteligencia geoespacial.
- Deteccion de cambios y anomalias: al comparar embeddings de imagenes SAR de diferentes fechas, se pueden identificar variaciones sutiles en infraestructuras o zonas costeras, util para vigilancia ambiental o gestion de desastres.
- Generacion de captions automaticos para archivos SAR: el modelo puede describir automaticamente el contenido de parches de radar, facilitando la indexacion y busqueda en grandes repositorios de datos de observacion de la Tierra.
- Sistema de apoyo a la interpretacion de imagenes SAR para analistas no expertos: dado que SAR es dificil de interpretar visualmente, el modelo puede proporcionar descripciones textuales que ayuden a entender que representa cada imagen.
- Pre-entrenamiento para tareas downstream especificas: los embeddings de SARCLIP pueden usarse como inicializacion para clasificadores supervisados en dominios SAR concretos (deteccion de buques, segmentacion de infraestructuras), reduciendo la cantidad de datos etiquetados necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de arXiv (2510.22665) menciona experimentos de visualizacion t-SNE y evaluacion en tres datasets downstream, pero no se incluyen tablas de resultados numericos en los materiales proporcionados. Se recomienda consultar el paper para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ViT-L-14 en precision FP32 requiere aproximadamente 1,7 GB para los pesos. Con batch size reducido y usando FP16, puede ejecutarse en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, segun las recomendaciones del propio proyecto. Para entrenamiento o fine-tuning se recomienda al menos 16-24 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4070 o similares, siempre que se use un batch size pequeno (1-8) y precision mixta.
- Opciones de despliegue: el modelo es compatible con el ecosistema OpenCLIP, por lo que puede usarse con los scripts proporcionados en el repositorio (zero-shot.py, retrieval.py, zero-shot-inference.py). Tambien puede cargarse con la libreria transformers de Hugging Face si se adapta el codigo. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, al ser un modelo visual-textual.
- Latencia y throughput: no disponible. Dependera de la GPU y del batch size utilizado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SARCLIP-ViT-L-14 | ViT-L-14 (CLIP) | 427 M | n/d | MIT (codigo) | Hugging Face, GitHub |
| CLIP ViT-L-14 (original) | ViT-L-14 | 428 M | n/d | MIT | OpenCLIP, Hugging Face |
| RemoteCLIP (ViT-L-14) | ViT-L-14 | 428 M | n/d | MIT | GitHub, Hugging Face |

La diferencia principal frente a CLIP original es que SARCLIP esta entrenado exclusivamente con imagenes SAR, mientras que CLIP se entrena con imagenes naturales de internet. RemoteCLIP es un modelo similar, tambien basado en CLIP pero orientado a imagenes de teledeteccion optica y SAR, aunque con un enfoque distinto en los datos de entrenamiento. SARCLIP se distingue por su especializacion exclusiva en SAR y por publicar el dataset SARCAP (aunque con restricciones no comerciales).

## Limitaciones y advertencias

- Sesgos geograficos: el dataset SARCAP se basa en datos de fuentes especificas (Capella Space, ESA Copernicus, etc.), por lo que el rendimiento puede degradarse en regiones o tipos de terreno poco representados en el entrenamiento.
- Riesgo de alucinacion: como cualquier modelo vision-language, puede generar captions plausibles pero incorrectos, especialmente en escenarios de baja resolucion o con artefactos SAR complejos.
- Dominio limitado: el modelo esta disenado exclusivamente para SAR. Su uso en imagenes opticas de teledeteccion o en imagenes naturales producira resultados pobres.
- Idioma: solo soporta captions en ingles. No hay capacidad multilingue.
- Licencia del dataset: aunque el codigo es MIT, el dataset SARCAP tiene una licencia separada para uso no comercial e investigacion educativa. Esto limita el uso comercial de modelos fine-tuneados con estos datos.
- Contexto textual limitado: al ser un modelo CLIP, la generacion de texto no es posible; solo produce embeddings y puntuaciones de similitud. No es un modelo generativo.
- Documentacion incompleta: no se especifican detalles sobre el numero de tokens de entrenamiento, composicion exacta del dataset, o hiperparametros del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kdshivam/SARCLIP-ViT-L-14
- Repositorio GitHub: https://github.com/CAESAR-Radi/SARCLIP
- Paper (arXiv): https://arxiv.org/html/2510.22665v1
- Repositorio con pesos ViT-L-14: https://github.com/CAESAR-Radi/SARCLIP/tree/main/sar_clip/model_configs/ViT-L-14
- Variante alternativa en Hugging Face: https://huggingface.co/BiliSakura/SARCLIP-ViT-L-14
- OpenCLIP (base del codigo): https://github.com/mlfoundations/open_clip
