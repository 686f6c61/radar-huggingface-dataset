# codebucketsolutions/bolo-syspin-chhattisgarhi-female

## Resumen

`bolo-syspin-chhattisgarhi-female` es un modelo de síntesis de voz (text-to-speech) en formato ONNX para el idioma chhattisgarhi (`hne`), una lengua indoaria hablada principalmente en el estado de Chhattisgarh, India. Lo publica el usuario `codebucketsolutions` como parte del proyecto bolo, un servidor de voz que funciona sin PyTorch apoyándose en sherpa-onnx. No es un modelo entrenado desde cero: se trata de una conversión de formato del checkpoint original `SYSPIN/vits_Chhattisgarhi_Female`, desarrollado por el proyecto SYSPIN del SPIRE Lab (Indian Institute of Science, Bengaluru).

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variational autoencoder con discriminador adversarial que genera waveform directamente a partir de fonemas, sin vocoder separado. El repositorio ocupa aproximadamente 0,1 GB, lo que sitúa el modelo en la gama ligera y permite su despliegue en CPU y dispositivos de borde.

Su relevancia es doble: por un lado, cubre una lengua de bajos recursos con pocos recursos TTS públicos; por otro, su empaquetado ONNX y su integración con sherpa-onnx lo hacen directamente utilizable en entornos sin GPU y sin dependencias de PyTorch, algo poco habitual en modelos TTS de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, VAE + discriminador adversarial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | chhattisgarhi (`hne`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 (corpus SYSPIN) |
| Formato de pesos | ONNX (conversión desde checkpoint Coqui VITS) |

## Arquitectura y entrenamiento

El modelo es una conversión de formato, no un reentrenamiento. El checkpoint original es un VITS de Coqui, exportado a ONNX mediante `tools/voices/export_syspin.py` del proyecto bolo. VITS combina un encoder de texto, un prior y un decoder/postnet condicionados por alineamiento monotónico aprendido (MAS), junto con un discriminador multiperiodo que se usa solo en entrenamiento. La salida es waveform directamente, sin vocoder neuronal separado, lo que reduce latencia y complejidad de despliegue.

Los datos de entrenamiento proceden del corpus TTS SYSPIN del IISc, publicado bajo CC-BY-4.0. No se documentan en la información disponible el número de horas, la composición exacta del dataset ni si hubo ajuste fino adicional. Tampoco se detallan innovaciones técnicas más allá de la propia arquitectura VITS y de la exportación a ONNX para inferencia con sherpa-onnx.

## Capacidades

- Síntesis de voz (text-to-speech) en chhattisgarhi para voz femenina.
- Generación de waveform end-to-end sin vocoder externo.
- Inferencia sin PyTorch mediante sherpa-onnx (runtime ONNX).
- Ejecución en CPU y dispositivos de borde gracias al tamaño reducido (~0,1 GB).
- Integración con el servidor bolo mediante `bolo pull syspin-hne-female`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en chhattisgarhi: convertir artículos, noticias o textos educativos a audio para hablantes de la lengua, aprovechando que el modelo funciona en CPU y puede desplegarse en servidores modestos.
- Accesibilidad para personas con discapacidad visual: integrar el modelo en lectores de pantalla o aplicaciones de asistencia que necesiten una voz femenina en chhattisgarhi sin depender de servicios en la nube.
- Asistentes de voz locales: usar sherpa-onnx para incrustar el modelo en aplicaciones de escritorio o móviles que requieran TTS offline y con licencia permisiva (MIT).
- Preservación lingüística: generar material audio para documentación y aprendizaje del chhattisgarhi, una lengua con recursos digitales limitados.
- Sistemas de megafonía o avisos automatizados: anuncios en estaciones, aeropuertos o servicios públicos dirigidos a población chhattisgarhi, con latencia baja al no requerir GPU.
- Prototipado de pipelines TTS multilingües: emplear este modelo como una voz más dentro de un servidor bolo que sirva varias lenguas, seleccionando la voz según el idioma detectado.
- Investigación en TTS de bajos recursos: servir como línea base reproducible para comparar conversiones ONNX frente a checkpoints Coqui originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo es lo bastante pequeño (~0,1 GB de pesos) como para caber en cualquier GPU con al menos 1 GB de memoria libre, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer (GTX 1050 o superior, RTX 3060, RTX 4090) puede alojarlo, si bien el diseño apunta a ejecución en CPU.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: sherpa-onnx (runtime principal), servidor bolo (`bolo pull syspin-hne-female`), y en general cualquier runtime compatible con ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| bolo-syspin-chhattisgarhi-female | VITS | chhattisgarhi (`hne`) | MIT | ONNX | ~0,1 GB |
| SYSPIN/vits_Chhattisgarhi_Female | VITS | chhattisgarhi (`hne`) | MIT | Coqui checkpoint | no disponible |
| Otros modelos VITS multilingües de Coqui | VITS | varios | según modelo | Coqui / ONNX | variable |

La comparación más directa es con el checkpoint original de SYSPIN, del que este repositorio es una conversión de formato sin cambios en los pesos. Frente a otros modelos TTS multilingües, la diferencia principal es la cobertura de una lengua de bajos recursos y el empaquetado ONNX listo para sherpa-onnx.

## Limitaciones y advertencias

- Modelo de una sola voz (femenina) y un solo idioma (`hne`); no admite cambio de hablante ni multilingüismo.
- Al ser una conversión de formato, hereda cualquier limitación del checkpoint original de SYSPIN, que no se documenta en detalle.
- Riesgo de artefactos o pronunciación incorrecta en palabras fuera del dominio del corpus de entrenamiento.
- No hay información publicada sobre sesgos, calidad perceptual (MOS) ni robustez ante texto ruidoso.
- La licencia MIT aplica a los pesos, pero los datos de entrenamiento son CC-BY-4.0; conviene revisar las obligaciones de atribución si se redistribuye el modelo o se usa comercialmente.
- No se documentan requisitos de normalización de texto ni de fonemización previa; el usuario debe verificar el pipeline de entrada esperado por sherpa-onnx.
- Sin benchmarks ni métricas objetivas, la evaluación de calidad debe hacerse manualmente antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-chhattisgarhi-female
- Modelo original SYSPIN: https://huggingface.co/SYSPIN/vits_Chhattisgarhi_Female
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx: no disponible en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
- Corpus SYSPIN (SPIRE Lab, IISc): no disponible en la información proporcionada
