# notashwinii/nepali-embossed-plate-reader

## Resumen

`nepali-embossed-plate-reader` es un clasificador de caracteres basado en una red neuronal convolucional (CNN) muy pequena, publicada por el usuario notashwinii, que resuelve un problema muy concreto: leer las matrículas embossed (en relieve) de Nepal, que desde hace unos anos usan caracteres latinos y digitos (por ejemplo, `B AD 1484`) en lugar de la grafia devanagari de las placas antiguas. El modelo no procesa la imagen completa de la matrícula, sino que clasifica caracteres individuales en 36 clases posibles, y se distribuye junto a un script (`read_embossed.py`) que segmenta el recorte de la placa en caracteres y compone la lectura final.

El modelo es deliberadamente minimalista: 361.988 parametros totales (aproximadamente 1,4 MB en safetensors), lo que lo convierte en un componente ligero que puede ejecutarse en CPU sin dificultad. No es un modelo de lenguaje ni un sistema OCR general, sino un clasificador especializado de caracteres de matricula con una pipeline de preprocesado asociada (umbralizacion, deteccion de blobs oscuros, filtrado de elementos no textuales como la bandera de Nepal o la palabra de la provincia, y ordenacion de lectura).

Su relevancia radica en que los modelos publicos de matriculas nepalesas estan entrenados sobre placas antiguas en devanagari y fallan sistematicamente con las nuevas placas embossed. Este modelo cubre ese hueco con datos reales transcritos manualmente, aunque con un rendimiento limitado en placas completas (alrededor del 50% de lectura exacta en el conjunto de prueba), lo que lo situa como una base de partida mas que como una solucion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pequena (clasificador de caracteres, 36 clases) |
| Parametros totales | 361.988 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de ~1,4 MB; cuantizacion no documentada) |
| Idiomas soportados | no disponible (reconoce caracteres latinos y digitos; incluye clases devanagari en entrenamiento pero no se usan en inferencia) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de clasificacion de imagenes de caracteres con 36 clases de salida. El autor no detalla en la model card el numero de capas, canales ni la funcion de perdida, por lo que la descripcion arquitectonica precisa no esta disponible. El modelo se distribuye con un script (`read_embossed.py`) que implementa la pipeline completa de lectura: umbralizacion de la placa (caracteres oscuros sobre fondo blanco), extraccion de blobs oscuros con forma de caracter, descarte de la bandera roja de Nepal, pegatinas y la palabra de la provincia (mas corta que los caracteres de registro), ordenacion de las piezas en orden de lectura (contemplando placas inclinadas y placas de motocicleta de dos lineas) y clasificacion de cada pieza restringiendo la salida a letras latinas y digitos.

El entrenamiento combina cuatro fuentes: tres conjuntos publicos de Kaggle de caracteres de matriculas nepalesas (Apache-2.0, MIT y MIT) y aproximadamente 400 caracteres recortados de 80 placas embossed reales del dataset `mukulboro/nepali-private-license-plates` (CC-BY-4.0), transcritos y verificados manualmente. Las 110 placas embossed disponibles se dividieron por coche (30 reservadas para prueba), y se eliminaron imagenes duplicadas exactas. Las clases incluyen digitos devanagari y siete silabas de zona (BA, PA, CHA, KHA, KO, ME, PRA) porque aparecen en los conjuntos publicos, aunque la inferencia solo admite caracteres latinos y digitos. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion de caracteres individuales de matriculas embossed nepalesas en 36 clases (letras latinas, digitos y algunas clases devanagari heredadas del entrenamiento).
- Lectura de placas completas mediante el script `read_embossed.py`: segmentacion, filtrado de ruido y ordenacion de lectura.
- Manejo de placas inclinadas y placas de motocicleta de dos lineas en la etapa de ordenacion.
- Restriccion de salida a letras latinas y digitos en la lectura final, descartando predicciones fuera de ese alfabeto.
- Entrada: recorte de la placa en formato BGR (compatible con OpenCV). La deteccion de la placa en la foto es un paso externo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de un modelo generativo.
- No lee la palabra de la provincia situada sobre el numero (por ejemplo, BAGMATI).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la clasificacion de caracteres.

## Casos de uso

- Lectura de matriculas en accesos de parking privado: dado un recorte de placa capturado por una camara fija a corta distancia, el modelo clasifica los caracteres y devuelve la matricula en texto para abrir la barrera o registrar la entrada.
- Digitalizacion de inventarios de flotas: procesar fotografias de las placas de vehiculos de una empresa para extraer el numero de registro y cruzarlo con una base de datos interna, usando el script de lectura sobre recortes ya detectados.
- Verificacion manual asistida: en aplicaciones de inspeccion donde un operador fotografia la placa, el modelo propone una lectura que el operador confirma o corrige, reduciendo el tiempo de tecleo.
- Prototipos de investigacion sobre OCR de matriculas nepalesas: servir como linea base reproducible (MIT, pesos safetensors, pipeline incluida) para comparar mejoras en segmentacion o clasificacion.
- Preprocesado en pipelines de vision: integrar el clasificador como etapa final de un detector de placas generico, aprovechando que el modelo solo necesita el recorte de la placa y no la imagen completa.
- Educacion y demos: por su tamano (1,4 MB) y su licencia permisiva, es adecuado para talleres y demostraciones de segmentacion de caracteres y clasificacion CNN en entornos con recursos limitados, incluso en CPU.
- Analisis de calidad de imagen en captura: comparar lecturas entre distintas condiciones de iluminacion o angulo para evaluar la robustez del pipeline de captura antes de desplegar un sistema mayor.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card son los siguientes:

| Prueba | Resultado |
|---|---:|
| Caracteres individuales recortados de placas reales (161) | 92,5% correctos |
| Placas completas, recortadas por su caja etiquetada (30) | 53% leidas exactamente |
| Placas completas, a traves de una pipeline de deteccion completa (30) | 50% leidas exactamente, 20% de tasa de error de caracteres |
| Recortes embossed limpios del split de test de theciceerguy (559) | 99,6% correctos |

El autor senala que, antes de anadir los recortes de placas reales, la misma red obtenia un 70,8% de acierto en caracteres reales y un 20% en placas completas, lo que ilustra la brecha entre los conjuntos publicos limpios y las condiciones reales. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo pesa aproximadamente 1,4 MB en safetensors y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: cualquiera con soporte CUDA, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100; no requiere hardware de gama alta.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde (Raspberry Pi, Jetson Nano) siempre que se disponga de PyTorch y OpenCV.
- Opciones de despliegue: PyTorch nativo con el script `read_embossed.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vision de este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia dominante sera la del preprocesado con OpenCV y la del detector de placas externo, no la de la CNN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nepali-embossed-plate-reader | 361.988 | no aplica | 50% placas exactas (pipeline completa) | MIT | Hugging Face |
| Modelos publicos de matriculas nepalesas en devanagari | no disponible | no aplica | fallan en placas embossed segun el autor | no disponible | no disponible |
| OCR genericos (Tesseract, EasyOCR, PaddleOCR) | no disponible | no aplica | no evaluados en la model card para este dominio | licencias variadas | amplia |

No se dispone de datos cuantitativos de modelos comparables en la informacion proporcionada; la comparativa con OCR genericos requeriria una evaluacion propia sobre el mismo conjunto de placas.

## Limitaciones y advertencias

- El conjunto de prueba de placas completas es muy pequeno (30 placas); el autor estima que el 50% real podria situarse entre el 35% y el 65%.
- Todas las placas reales son de coches privados aparcados en Katmandu, fotografiados de cerca; no hay imagenes de camaras de trafico ni de condiciones adversas.
- 30 de las 110 placas reales se segmentan en un numero incorrecto de piezas; la mayoria de los errores provienen de la segmentacion, no de la clasificacion de caracteres.
- Las letras I, O, Q, U, V, W, X e Y nunca aparecen en los datos de entrenamiento y no pueden predecirse.
- No lee la palabra de la provincia ni caracteres fuera del alfabeto latino y los digitos en la inferencia final.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de lecturas incorrectas silenciosas (clasificaciones erroneas sin indicador de confianza documentado).
- Sesgos conocidos: no documentados; la distribucion de datos se limita a placas privadas de Katmandu.
- Licencia MIT, permisiva para uso comercial, pero el autor no ofrece garantias de exactitud para produccion.
- La deteccion de la placa en la imagen es un paso externo no incluido; el rendimiento real dependera de la calidad del detector empleado.

## Enlaces

- Hugging Face: https://huggingface.co/notashwinii/nepali-embossed-plate-reader
- Dataset de placas: https://huggingface.co/datasets/mukulboro/nepali-private-license-plates
- Dataset de caracteres (Kaggle, Apache-2.0): https://www.kaggle.com/datasets/ishworsubedii/nepalese-license-plate-character-dataset
- Dataset de caracteres (Kaggle, MIT): https://www.kaggle.com/datasets/kshitizgajurel042/individual-character-images-of-nepali-lp
- Dataset de deteccion de placas embossed (Kaggle, MIT): https://www.kaggle.com/datasets/theciceerguy/embossed-number-plate-detection-nepal-dataset
