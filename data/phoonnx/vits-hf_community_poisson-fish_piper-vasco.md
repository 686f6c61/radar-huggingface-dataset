# Phoonnx/vits-hf_community_poisson-fish_piper-vasco

## Resumen

`vits-hf_community_poisson-fish_piper-vasco` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx dentro de su repositorio agregador `Phoonnx/phoonnx-vits`. Se trata de una extracción de una única carpeta (`hf_community__poisson-fish__piper-vasco`) del citado repositorio, empaquetada para su uso con la librería `phoonnx`, una herramienta de TigreGotico orientada a la inferencia de voces Piper y VITS en formato ONNX.

Por el nombre de la carpeta y las etiquetas, el modelo corresponde a una voz Piper en euskera (vasco), derivada del proyecto `poisson-fish/piper-vasco`, un conjunto de voces Piper para esta lengua. Los pesos se distribuyen en formato ONNX, lo que facilita la inferencia en CPU y en entornos sin GPU. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un modelo VITS de tamaño reducido.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, sin model card propia más allá de la referencia al repositorio origen, sin métricas publicadas y sin documentación sobre el proceso de entrenamiento. Resulta útil únicamente como pieza de un ecosistema mayor de voces Piper para euskera, y su evaluación debe hacerse a partir de las características conocidas de la familia VITS/Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no textual) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | euskera (vasco), segun el nombre de la carpeta de origen |
| Licencia | MIT (segun la model card; el repositorio origen indica que cada subcarpeta hereda la licencia original) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. La variante Piper simplifica y optimiza esta arquitectura para inferencia ligera en CPU, con un front-end fonético basado en espeak-ng y una exportación a ONNX que permite ejecución en dispositivos de bajos recursos.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de horas de audio, la composición del corpus ni si se aplicaron técnicas de ajuste fino o destilación. La model card únicamente indica que los archivos conservan las rutas del repositorio `Phoonnx/phoonnx-vits` y que la licencia se hereda de la carpeta original. El autor del repositorio origen (`poisson-fish/piper-vasco`) no documenta en esta ficha detalles técnicos del entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en euskera, con salida de audio mono.
- Inferencia en formato ONNX, apta para CPU y para entornos sin aceleración por GPU.
- Integración con la librería `phoonnx`, que actúa como runtime para voces Piper/VITS.
- Front-end fonético basado en espeak-ng (variante `lfn` en el repositorio origen, aunque no se confirma para esta carpeta concreta).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente acústico.
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe: no disponible; el nombre indica únicamente euskera.

## Casos de uso

- Lectura de textos en euskera para accesibilidad: el modelo puede convertir artículos, noticias o documentos en audio para personas con discapacidad visual, aprovechando su formato ONNX ligero y su ejecución en CPU.
- Locución automatizada de contenidos web: integración en un pipeline que genere ficheros de audio a partir de artículos o blogs en euskera, con bajo coste de infraestructura al no requerir GPU.
- Asistentes de voz embebidos: despliegue en dispositivos de bajos recursos (Raspberry Pi, routers, sistemas empotrados) gracias al tamaño reducido del repositorio (~0,1 GB) y a la naturaleza ONNX del modelo.
- Generación de avisos y notificaciones habladas: sistemas de megafonía o alertas en euskera para administraciones públicas o transporte, donde se requiere una voz sintética comprensible y de baja latencia.
- Prototipado de aplicaciones de aprendizaje de euskera: uso como referencia de pronunciación en herramientas educativas, siempre que se valide la calidad de la síntesis con hablantes nativos.
- Doblaje y postproducción de bajo coste: generación de borradores de voz en euskera para vídeos o podcasts antes de una locución humana definitiva.
- Integración en el ecosistema `phoonnx`: uso como una voz más dentro de una aplicación que ya emplee esta librería para gestionar múltiples voces Piper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) y la arquitectura VITS/Piper, es esperable que quepa en menos de 1 GB de memoria, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles; el modelo está pensado para inferencia en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna con soporte ONNX Runtime, pero no documentado.
- Opciones de despliegue: `phoonnx` (runtime específico del autor), ONNX Runtime, y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-hf_community_poisson-fish_piper-vasco` | VITS (Piper) | Euskera | ONNX | MIT | Artefacto derivado de `poisson-fish/piper-vasco` |
| `poisson-fish/piper-vasco` (origen) | VITS (Piper) | Euskera | Piper/ONNX | no disponible en esta ficha | Repositorio fuente del que se extrae la carpeta |
| Otras voces Piper para lenguas minoritarias | VITS (Piper) | Diversas | ONNX | Variable por voz | Familia amplia; calidad y licencia dependen del autor original |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es mínima y no documenta el proceso de entrenamiento, los datos ni las métricas de calidad; la evaluación rigurosa requiere pruebas propias.
- El modelo es un artefacto derivado: la licencia MIT declarada debe contrastarse con la de la carpeta original en `poisson-fish/piper-vasco`, ya que el repositorio origen advierte de que cada subcarpeta hereda la licencia de su fuente y algunas voces del agregador llevan `license: other`.
- No hay información sobre sesgos, calidad de pronunciación ni cobertura léxica del euskera; es probable que falle en neologismos, nombres propios y términos técnicos.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en textos fuera de dominio.
- No apto para clonación de voz ni para síntesis expresiva: la arquitectura Piper está orientada a locución neutra.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14), lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- No se documenta soporte multilingüe ni cambio de idioma en tiempo de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_poisson-fish_piper-vasco
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Piper (referencia de la arquitectura): no disponible en la información proporcionada
- Repositorio `poisson-fish/piper-vasco`: no disponible como enlace directo en la información proporcionada
