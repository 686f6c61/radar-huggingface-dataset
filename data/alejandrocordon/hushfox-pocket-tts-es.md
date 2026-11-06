# alejandrocordon/hushfox-pocket-tts-es

## Resumen

Hushfox Pocket TTS (Spanish) es una exportación a ONNX con cuantización int8 del checkpoint en castellano de Pocket TTS, el modelo de síntesis de voz desarrollado por Kyutai. El artefacto lo publica el usuario alejandrocordon para alimentar la aplicación Hushfox, orientada a síntesis de voz en dispositivo (on-device), y está empaquetado específicamente para el runtime sherpa-onnx 2.0.1. No se trata de un modelo entrenado desde cero, sino de una conversión de formato y cuantización de los pesos originales de Kyutai, sin reentrenamiento.

El modelo resuelve el problema de disponer de un TTS en castellano ejecutable localmente en hardware modesto, sin depender de servicios en la nube. Para ello se sirve de cinco grafos ONNX separados (`lm_main`, `lm_flow`, `encoder`, `decoder` y `text_conditioner`) más el vocabulario y las puntuaciones del tokenizador, con un tamaño total de repositorio de aproximadamente 0,2 GB. La cuantización int8 se aplica únicamente a las operaciones MatMul de `lm_flow`, `lm_main` y `decoder`.

La relevancia actual del artefacto es doble: por un lado, demuestra la viabilidad de exportar los modelos Pocket TTS a un ecosistema de inferencia ligero como sherpa-onnx; por otro, ofrece una vía práctica para integrar voz sintética en castellano en aplicaciones de escritorio o móviles con requisitos de privacidad y latencia estrictos. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai); exportación a ONNX con grafos separados `lm_main`, `lm_flow`, `encoder`, `decoder` y `text_conditioner` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (solo MatMul) en `lm_flow`, `lm_main` y `decoder`; `encoder` y `text_conditioner` en precisión original |
| Idiomas soportados | español (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 14) + `vocab.json` y `token_scores.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Pocket TTS de Kyutai, un sistema de síntesis de voz que en esta exportación se descompone en cinco componentes ONNX: un modelo de lenguaje principal (`lm_main`, 76,3 MB en int8), un módulo de flujo (`lm_flow`, 9,96 MB en int8), un codificador (`encoder`, 39,3 MB), un decodificador (`decoder`, 22,7 MB en int8) y un acondicionador de texto (`text_conditioner`, 16,4 MB). El exportador utilizado es `csukuangfj/pocket-tts-onnx-export` en la revisión `f075c00`, derivado del exportador de KevinAHM, con un parche específico para el modelo español v2 que ajusta `inner_dim` a 32 e incorpora el vector aprendido `bos_before_voice`, antepuesto dentro de `encoder.onnx`.

La conversión se realizó con torch 2.8.0, onnx 1.17.0 y onnxruntime 1.17.1, y la verificación de equivalencia PyTorch↔ONNX del exportador pasa correctamente. Los pesos de origen proceden de `kyutai/pocket-tts` en la revisión `3e82814a68665eec246ff649b14c71331f955c06`, fichero `languages/spanish/model.safetensors`. No se ha producido reentrenamiento ni ajuste fino: los cambios se limitan a conversión de formato, cuantización int8 y renombrado de ficheros. Los ficheros de tokenizador se generaron desde `languages/spanish/tokenizer.json` con un conversor equivalente al de sherpa-onnx v2.0.1. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni las etapas de alineamiento o RLHF empleadas por Kyutai.

## Capacidades

- Síntesis de voz (text-to-speech) en castellano a partir de texto de entrada.
- Ejecución completamente local mediante sherpa-onnx 2.0.1 con la configuración `OfflineTtsPocketModelConfig`, sin llamadas a servicios externos.
- Inferencia en dispositivo con un peso total de aproximadamente 0,2 GB, adecuada para entornos con recursos limitados.
- Integración con el ecosistema sherpa-onnx, que facilita su uso en aplicaciones de escritorio, móviles y sistemas embebidos.
- No incluye clonación de voz: la model card prohíbe explícitamente la suplantación de identidad vocal sin consentimiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa ni procesamiento multimodal.

## Casos de uso

- **Lectura de textos en aplicaciones de accesibilidad:** integración en lectores de pantalla o asistentes para personas con discapacidad visual, ejecutando el modelo en local para preservar la privacidad del contenido leído.
- **Asistentes de voz en dispositivos sin conectividad:** despliegue en dispositivos empotrados o portátiles con sherpa-onnx, donde la ausencia de red impide recurrir a APIs de TTS en la nube.
- **Locución de contenido en castellano en aplicaciones de productividad:** generación de resúmenes hablados de correos, notas o artículos dentro de una app de escritorio, con latencia baja al no requerir peticiones remotas.
- **Síntesis de voz para videojuegos y prototipos interactivos:** generación de diálogos en castellano en tiempo de ejecución, con un footprint de 0,2 GB que permite empaquetar el modelo junto con el juego.
- **Sistemas de información al viajero o señalética hablada:** anuncios pregrabados o dinámicos en estaciones, aeropuertos o comercios, donde se requiere funcionamiento offline y actualizaciones de texto frecuentes.
- **Investigación en TTS y evaluación de exportaciones ONNX:** uso del artefacto como referencia para comparar la calidad y latencia de la cuantización int8 frente a los pesos originales de Kyutai en experimentos reproducibles.
- **Integración en aplicaciones de privacidad estricta:** entornos sanitarios, legales o corporativos donde el texto a sintetizar no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la verificación de equivalencia PyTorch↔ONNX del exportador pasa, pero no aporta métricas de calidad de audio (MOS, WER), latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita; el repositorio completo ocupa aproximadamente 0,2 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja o incluso inferencia en CPU.
- **GPU recomendadas:** no se especifican; por el tamaño del modelo, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay datos publicados que lo confirmen.
- **Compatibilidad con GPU consumer:** previsiblemente sí, dado el tamaño reducido de los grafos; no obstante, la model card no aporta cifras de consumo.
- **Opciones de despliegue:** sherpa-onnx 2.0.1 es el runtime de referencia (`OfflineTtsPocketModelConfig`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hushfox Pocket TTS ES (este modelo) | no disponible | no disponible | es | CC BY 4.0 | ONNX int8 |
| kyutai/pocket-tts (original) | no disponible | no disponible | varios (incluye es) | CC BY 4.0 | safetensors (PyTorch) |
| Alternativas TTS open source en castellano | no disponible | no disponible | es | variable | variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos TTS en castellano (por ejemplo, Coqui XTTS, Piper o VITS), ya que la model card no incluye métricas de calidad ni datos de rendimiento.

## Limitaciones y advertencias

- **Prohibición de suplantación:** la model card prohíbe explícitamente la clonación de voz sin consentimiento explícito y legal, así como presentar el audio generado como grabaciones reales de personas. Hushfox no ofrece clonación de voz.
- **Idioma único:** el artefacto solo soporta castellano; no se ha validado para otros idiomas.
- **Sin datos de calidad:** no hay métricas publicadas de naturalidad, inteligibilidad o robustez frente a texto complejo (números, siglas, nombres propios).
- **Dependencia de versión:** el modelo está validado para sherpa-onnx 2.0.1; versiones distintas pueden requerir ajustes de configuración.
- **Riesgo de alucinación fonética:** como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera de dominio o extranjerismos.
- **Licencia CC BY 4.0:** permite uso comercial, pero exige atribución a Kyutai y al exportador; deben conservarse los avisos de licencia.
- **Sin garantías de producción:** el artefacto tiene cero descargas y cero likes en el momento de la ficha, y no se documentan pruebas de estrés ni auditorías de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alejandrocordon/hushfox-pocket-tts-es
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Exportador ONNX: https://github.com/csukuangfj/pocket-tts-onnx-export
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Exportador original de KevinAHM: no disponible como enlace directo en la información proporcionada.
