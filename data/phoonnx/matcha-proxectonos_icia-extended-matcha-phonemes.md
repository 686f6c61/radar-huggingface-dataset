# Phoonnx/matcha-proxectonos_icia-extended-matcha-phonemes

## Resumen

`Phoonnx/matcha-proxectonos_icia-extended-matcha-phonemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, distribuido en formato ONNX para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Lo publica el usuario Phoonnx como un modelo individual extraído del repositorio agregador `Phoonnx/phoonnx-matcha`, en la carpeta `proxectonos__icia-extended-matcha-phonemes`. Se trata, por tanto, de una voz concreta del conjunto de voces empaquetadas para el motor phoonnx, no de un modelo fundacional entrenado desde cero por este autor.

El modelo resuelve la conversión de texto a audio mediante la familia Matcha, que combina un modelo acústico de flujo continuo (flow-matching) con un vocoder neuronal para generar formas de onda. Su relevancia es práctica: permite a desarrolladores integrar síntesis de voz local, ligera y sin dependencias de servicios en la nube, dentro de pipelines que utilicen phoonnx como backend, con pesos ONNX optimizados para inferencia en CPU o GPU. El identificador de voz expuesto por phoonnx es `proxectonos/icia-extended-matcha-phonemes`.

La información pública disponible es muy escasa: la model card es mínima, no declara idiomas, no documenta el dataset de entrenamiento ni ofrece métricas. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que es coherente con un modelo acústico y vocoder de tamaño moderado en formato ONNX. La licencia declarada es GPL-3.0, lo que condiciona su uso en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico flow-matching + vocoder neuronal, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto declarada) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el sufijo "icia" sugiere gallego, pero no está confirmado en la card) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a Matcha-TTS, un sistema de síntesis neuronal que modela la distribución acústica mediante flow matching (integración de campos vectoriales sobre un proceso de difusión continuo) y la convierte en audio con un vocoder neuronal. El repositorio empaqueta los componentes necesarios para phoonnx, que ejecuta el modelo acústico y el vocoder en formato ONNX. No se dispone de detalles sobre el vocoder concreto asociado a esta voz ni sobre la configuración de capas, dimensiones o número de pasos de muestreo.

No hay información en la documentación disponible sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de ajuste fino, RLHF o DPO, ni sobre innovaciones técnicas específicas de esta variante. La model card remite únicamente a la licencia registrada en el repositorio de origen y al identificador de voz, sin describir el proceso de entrenamiento. Cualquier afirmación sobre el dataset o las horas de audio empleadas sería especulativa y, por tanto, se omite.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) mediante el pipeline declarado `text-to-speech`.
- Generación de audio local con pesos ONNX, apta para inferencia sin servicios externos.
- Integración nativa con la librería phoonnx mediante el identificador de voz `proxectonos/icia-extended-matcha-phonemes`.
- Conversión de fonemas a audio (el nombre del modelo hace referencia explícita a "matcha-phonemes"), lo que sugiere entrada basada en fonemas además de texto.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; se trata de un modelo puramente generativo de audio.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Lectura de contenido web en local: el modelo puede convertir artículos o textos de interfaz en audio dentro de una aplicación de escritorio o servidor, usando phoonnx como backend ONNX y evitando llamadas a APIs de terceros.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o sistemas de narración que necesiten una voz local, de baja latencia y desplegable en el propio dispositivo.
- Generación de audiolibros o podcasts automatizados: procesamiento por lotes de capítulos de texto a audio con un motor ligero (repo de ~0,1 GB) que puede ejecutarse en infraestructura modestа.
- Asistentes de voz embebidos: uso en dispositivos con recursos limitados donde ONNX Runtime permite inferencia en CPU, reduciendo el consumo energético frente a modelos de mayor tamaño.
- Pruebas de integración TTS en pipelines de CI: al ser un modelo pequeño y autocontenido, sirve para validar flujos de phoonnx y comprobar la canalización texto-fonemas-audio antes de desplegar voces de mayor calidad.
- Prototipado de voces para aplicaciones en gallego: si se confirma la naturaleza gallega de la voz "icia", puede emplearse en demos de síntesis para ese idioma dentro de entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con un repositorio de ~0,1 GB en ONNX, el modelo acústico y el vocoder caben holgadamente en GPUs de consumo; se estima un uso de memoria en el rango de cientos de MB a ~1 GB, pero no hay cifras oficiales.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) puede ejecutarlo; en muchos casos la inferencia en CPU con ONNX Runtime es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM; también en CPU.
- Opciones de despliegue: phoonnx (backend principal), ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son adecuados para este tipo de modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matcha-proxectonos_icia-extended-matcha-phonemes | no disponible | no disponible | no disponible | GPL-3.0 | Hugging Face (Phoonnx) |
| Piper TTS (voces ONNX) | no disponible | no disponible | no disponible | MIT (mayoritariamente) | Hugging Face / GitHub |
| Coqui TTS (modelos VITS) | no disponible | no disponible | no disponible | MPL-2.0 / otras | Hugging Face / GitHub |
| Kokoro TTS | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

La comparación se limita a la categoría (TTS ligero en ONNX); no hay datos de parámetros ni benchmarks para este modelo concreto, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Información pública mínima: la model card no documenta idioma, dataset, vocoder ni métricas, lo que dificulta evaluar su calidad antes de integrarlo.
- Licencia GPL-3.0: el uso comercial en productos distribuidos puede obligar a liberar el código combinado bajo la misma licencia; conviene revisar con asesoría legal antes de producción.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas, artefactos o entonación inadecuada en textos fuera del dominio de entrenamiento.
- Cobertura de idioma incierta: el sufijo "icia" sugiere gallego, pero no está confirmado; usar el modelo con otros idiomas puede degradar gravemente la calidad.
- Sin datos de sesgos: no se documentan sesgos de género, acento o prosodia.
- Dependencia de phoonnx: el modelo está empaquetado para esa librería y conserva las rutas del repositorio original, lo que puede complicar su uso con otros frameworks TTS.
- Sin garantías de mantenimiento: creado y actualizado en la misma fecha, con cero descargas y cero likes, lo que indica ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-proxectonos_icia-extended-matcha-phonemes
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-matcha
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
