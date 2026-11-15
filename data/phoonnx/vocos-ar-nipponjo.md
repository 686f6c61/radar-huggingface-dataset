# Phoonnx/vocos-ar-nipponjo

## Resumen

vocos-ar-nipponjo es un vocoder (modelo de síntesis de forma de onda a partir de representaciones mel) empaquetado por Phoonnx a partir del proyecto upstream nipponjo/tts-arabic-onnx. No es un modelo de texto a voz completo: es el componente final de un pipeline TTS que convierte espectrogramas mel en audio, y está etiquetado para el idioma árabe (`ar`) según el nombre de carpeta de sus voces asociadas.

El modelo se distribuye en formato ONNX y se ejecuta mediante la librería phoonnx (Python y OVOS), una biblioteca de TTS basada en ONNX mantenida por TigreGotico. Su relevancia es de nicho: sirve para integrar síntesis de voz en árabe dentro del ecosistema phoonnx/OVOS, no como modelo generalista.

La información pública es muy escasa: el repositorio ocupa 0,1 GB, no registra descargas ni likes, y la model card no documenta parámetros, contexto ni datos de entrenamiento. La licencia figura como "other" sin texto asociado, por lo que su uso comercial exige verificar la licencia del proyecto upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | vocoder (basado en Vocos, según la colección "Vocoders" de Phoonnx) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un vocoder; opera sobre tramas mel) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el grado de cuantización del grafo no está documentado) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | other (sin texto de licencia registrado; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card indica únicamente "Architecture: Vocoders" y enlaza a la colección de vocoders de Phoonnx. Vocos es una familia de vocoders que genera la forma de onda directamente en el dominio de la frecuencia (predicción de coeficientes STFT) en lugar de muestrear en el dominio temporal, lo que reduce el coste computacional frente a vocoders autoregresivos o basados en difusión. No obstante, la ficha no confirma explícitamente que este checkpoint use esa variante concreta ni detalla su configuración interna.

No hay información sobre datos de entrenamiento: ni número de tokens, ni horas de audio, ni composición del corpus, ni si hubo ajuste fino con RLHF/DPO (poco habitual en vocoders). El modelo procede del paquete nipponjo/tts-arabic-onnx, que agrupa los componentes del pipeline TTS árabe; este repositorio solo reempaqueta el vocoder para phoonnx.

## Capacidades

- Conversión de representaciones mel a forma de onda de audio (síntesis de voz) en el pipeline TTS de phoonnx.
- Soporte del idioma árabe, heredado del pipeline upstream nipponjo/tts-arabic-onnx.
- Ejecución mediante ONNX Runtime a través de la librería phoonnx, tanto en Python como en OVOS.
- Integración con scriptconv para normalización de texto, conversión de escritura y fonemización dentro del mismo ecosistema.
- No soporta tool calling, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un vocoder.
- La model card advierte que el índice de voces de phoonnx no empareja ninguna voz con este vocoder, por lo que no es utilizable de forma autónoma sin un modelo acústico compatible.

## Casos de uso

- Síntesis de voz en árabe dentro de asistentes OVOS: el vocoder se inserta al final del pipeline phoonnx para generar el audio a partir de la salida del modelo acústico, siempre que se disponga de una voz compatible.
- Investigación en TTS árabe: sirve como componente de referencia para comparar la calidad de waveform de distintos vocoders sobre el mismo modelo acústico upstream.
- Pruebas de integración de pipelines ONNX: al ser un artefacto pequeño (0,1 GB) y en ONNX, es adecuado para validar el flujo completo de phoonnx en entornos de CI sin depender de GPU.
- Despliegue en dispositivos de bajos recursos: la ejecución con ONNX Runtime permite inferencia en CPU, útil para prototipos embebidos o sin acelerador.
- Evaluación de licencias y procedencia de modelos: caso de estudio de reempaquetado de artefactos de terceros con licencia ambigua, útil para equipos que auditan dependencias de IA.
- Reproducción del pipeline nipponjo/tts-arabic-onnx: permite reconstruir localmente el sistema TTS árabe original sustituyendo el vocoder por este checkpoint empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,1 GB) el modelo es muy ligero y probablemente quepa en cualquier GPU consumer, pero no hay cifras oficiales.
- GPU recomendadas: no disponibles. Un vocoder de este tamaño debería ejecutarse en CPU con latencia aceptable, aunque no se documenta throughput.
- GPU consumer: previsiblemente compatible con cualquier GPU con unos pocos GB de VRAM; sin confirmación del autor.
- Opciones de despliegue: ONNX Runtime a través de phoonnx (Python y OVOS); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vocos-ar-nipponjo (este) | Vocoder | ar | ONNX | other (sin texto) | Hugging Face, 0 descargas |
| nipponjo/tts-arabic-onnx | Pipeline TTS completo | ar | ONNX | no disponible en esta ficha | Hugging Face |
| Otros vocoders de la colección Phoonnx | Vocoder | variable | ONNX | variable | Colección Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia "other" sin texto registrado: no se puede asumir uso comercial; hay que revisar la licencia del proyecto upstream nipponjo/tts-arabic-onnx antes de cualquier despliegue.
- El índice de voces de phoonnx no asocia ninguna voz a este vocoder, lo que limita su uso directo sin trabajo adicional de integración.
- No es un modelo de texto a voz autónomo: requiere un modelo acústico compatible que produzca las representaciones mel de entrada.
- Cobertura lingüística restringida al árabe según la metadata; no hay evidencia de soporte multilingüe.
- Sin datos de entrenamiento ni evaluación publicados: no es posible estimar sesgos acústicos, calidad percibida (MOS) ni robustez ante dominios distintos.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de artefactos de audio (ruido, inestabilidad) ante entradas fuera de distribución, sin métricas que lo cuantifiquen.
- Repositorio sin descargas ni validación comunitaria: menor fiabilidad de mantenimiento y soporte.
- Fechas de creación y actualización del repositorio (noviembre de 2026) resultan anómalas respecto a la fecha actual; conviene verificar la integridad del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vocos-ar-nipponjo
- Upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- Colección de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
