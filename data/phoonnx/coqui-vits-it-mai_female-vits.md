# Phoonnx/coqui-vits-it-mai_female-vits

## Resumen

`coqui-vits-it-mai_female-vits` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de una conversión al formato ONNX de un checkpoint VITS del ecosistema Coqui TTS, concretamente la voz `it-mai_female-vits`, entrenada sobre el corpus italiano M-AILABS con una voz femenina. El modelo forma parte del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que empaqueta múltiples voces Coqui en formato ONNX para su uso con la librería `phoonnx`.

El modelo resuelve la necesidad de disponer de una voz italiana femenina ligera y ejecutable en local, sin depender del stack original de Coqui TTS (que requiere PyTorch y sus dependencias). Al estar exportado a ONNX, puede ejecutarse con runtimes de inferencia ligeros y en entornos donde PyTorch no está disponible o resulta excesivo.

La relevancia es acotada: se trata de un artefacto de conversión de formato, no de un modelo nuevo. No hay información publicada sobre arquitectura detallada, número de parámetros ni datos de entrenamiento más allá de la referencia al corpus M-AILABS. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la arquitectura de síntesis de voz extremo a extremo popularizada por Coqui TTS. VITS combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento, lo que permite generar audio de forma directa a partir de texto sin etapas separadas de alineamiento.

El checkpoint original corresponde a la voz `it-mai_female-vits` del catálogo de Coqui, entrenada sobre el corpus italiano M-AILABS. No se dispone de información publicada sobre el número de horas de audio, el número exacto de pasos de entrenamiento ni la composición detallada del dataset más allá de la referencia a M-AILABS. El artefacto publicado en este repositorio es una exportación a ONNX del checkpoint original, manteniendo las rutas de ficheros del repositorio agregador `Phoonnx/phoonnx-coqui-vits`.

## Capacidades

- Síntesis de voz a partir de texto en italiano con voz femenina.
- Generación de audio en formato ONNX, ejecutable con runtimes compatibles sin PyTorch.
- Integración con la librería `phoonnx`, que gestiona la carga y la inferencia del modelo.
- Identificador de voz `coqui/it-mai_female-vits` para su uso dentro del ecosistema phoonnx.
- No se documentan capacidades de clonación de voz, control de emoción, multilingüismo ni tool calling.

## Casos de uso

- Lectura de contenido en italiano: el modelo puede convertir artículos, documentación o textos de interfaz en audio para aplicaciones de accesibilidad o consumo pasivo, al ser una voz italiana femenina preentrenada.
- Asistentes de voz locales: al ejecutarse en formato ONNX, puede integrarse en aplicaciones de escritorio o embebidas que necesiten síntesis de voz sin depender de servicios en la nube.
- Generación de audiolibros y pódcast: útil para producir narraciones en italiano de forma automatizada en pipelines de contenido.
- Sistemas de anuncios y notificaciones: adecuado para mensajes cortos en aplicaciones de transporte, comercio o domótica dirigidas a usuarios italianos.
- Pruebas y prototipado de interfaces conversacionales: permite validar flujos de voz en italiano sin incurrir en costes de API externas.
- Investigación en TTS: sirve como referencia de una voz VITS italiana en formato ONNX para comparativas de calidad o experimentos de despliegue ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto es plausible que funcione en CPU, pero no hay datos publicados.
- Opciones de despliegue: runtime ONNX compatible con la librería `phoonnx`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coqui-vits-it-mai_female-vits (este) | VITS | Italiano | ONNX | Apache-2.0 | Hugging Face (Phoonnx) |
| Coqui TTS `it-mai_female-vits` original | VITS | Italiano | PyTorch | Apache-2.0 | Catálogo Coqui |
| Otras voces de `Phoonnx/phoonnx-coqui-vits` | VITS | Varios | ONNX | Apache-2.0 (según fuente) | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos de la voz ni sobre la demografía del corpus M-AILABS más allá de la etiqueta "female".
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir artefactos acústicos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- El modelo solo cubre italiano; no se documenta soporte multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del corpus M-AILABS y del checkpoint original de Coqui antes de desplegarlo en producción.
- Al ser un artefacto de conversión sin métricas publicadas, no hay garantías documentadas sobre la fidelidad del audio respecto al checkpoint original en PyTorch.
- El repositorio no registra descargas ni validación de la comunidad, por lo que su fiabilidad en producción no está contrastada.

## Enlaces

- [Hugging Face: Phoonnx/coqui-vits-it-mai_female-vits](https://huggingface.co/Phoonnx/coqui-vits-it-mai_female-vits)
- [Repositorio agregador: Phoonnx/phoonnx-coqui-vits](https://huggingface.co/Phoonnx/phoonnx-coqui-vits)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
