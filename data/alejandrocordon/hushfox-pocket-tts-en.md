# alejandrocordon/hushfox-pocket-tts-en

## Resumen

Hushfox Pocket TTS (English) es una exportación a ONNX con cuantización int8 del modelo de síntesis de voz Pocket TTS desarrollado por Kyutai, empaquetada específicamente para su uso con la librería sherpa-onnx. El autor de la conversión es alejandrocordon, que la publica como parte del soporte de voz en local de su aplicación Hushfox. No se trata de un modelo nuevo: los pesos son idénticos a los de `kyutai/pocket-tts` y solo se ha realizado un cambio de formato (PyTorch a ONNX), cuantización int8 de tres de los cinco grafos y renombrado de ficheros, sin reentrenamiento.

El interés de esta ficha reside en su utilidad práctica: ofrece un pipeline TTS completo en inglés, listo para inferencia en CPU o GPU mediante sherpa-onnx, con un tamaño total de repositorio de 0,2 GB y sin dependencia de PyTorch en tiempo de ejecución. Esto lo hace adecuado para despliegues en dispositivos con recursos limitados, aplicaciones de escritorio o móviles y entornos donde el peso del runtime importa.

La información pública disponible es escasa: la model card se limita a documentar el proceso de exportación, los hashes de los ficheros y la licencia, sin detallar arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja esa limitación y marca explícitamente como "no disponible" todo aquello que no consta en la documentación del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Pocket TTS de Kyutai; pipeline con encoder, lm_main, lm_flow, decoder y text_conditioner) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (solo MatMul) en `lm_flow`, `lm_main` y `decoder`; `encoder` y `text_conditioner` en precisión original |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 14), tokenizador en `vocab.json` y `token_scores.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `kyutai/pocket-tts` en la documentación proporcionada. Lo que sí se documenta es la estructura del artefacto exportado: cinco grafos ONNX (`lm_flow.int8.onnx`, `lm_main.int8.onnx`, `encoder.onnx`, `decoder.int8.onnx` y `text_conditioner.onnx`) más dos ficheros de tokenizador convertidos desde el `tokenizer.model` de SentencePiece de Kyutai mediante el script `convert_tokenizer.py` de sherpa-onnx v2.0.1. Los nombres de los grafos sugieren un pipeline con un codificador de texto/audio, un modelo de lenguaje principal y un modelo de flujo, junto con un decodificador vocacional, pero la model card no detalla la función exacta de cada componente ni las dimensiones internas.

El proceso de exportación se realizó con la herramienta `csukuangfj/pocket-tts-onnx-export` (commit `f075c00`, licencia MIT), derivada del exportador de KevinAHM, usando torch 2.8.0, onnx 1.17.0, onnxruntime 1.17.1 y opset 14. La cuantización int8 se aplicó únicamente a operaciones MatMul mediante el flag `--quantize`. No hubo reentrenamiento ni ajuste fino: los ficheros publicados son byte a byte idénticos al resultado de ejecutar la herramienta sobre los pesos originales, y la model card incluye los hashes SHA-256 de cada fichero para verificarlo. No consta información sobre el dataset de entrenamiento, número de tokens, composición lingüística ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Inferencia mediante sherpa-onnx, con runtime ONNX Runtime en lugar de PyTorch.
- Ejecución en dispositivo (on-device), orientada a aplicaciones cliente con recursos limitados.
- Modelo cuantizado int8 en los componentes principales, lo que reduce el tamaño y el coste computacional de la inferencia.
- Tokenizador SentencePiece convertido a formato JSON compatible con sherpa-onnx.
- No consta soporte de clonación de voz; la model card prohíbe explícitamente la suplantación de voz y la clonación sin consentimiento.
- No consta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio: integración del pipeline sherpa-onnx en herramientas nativas para leer documentos o notificaciones, aprovechando el tamaño reducido del repositorio (0,2 GB) y la ausencia de dependencia de PyTorch.
- Asistentes de voz en local para aplicaciones móviles: el formato ONNX int8 permite ejecutar la síntesis en el propio dispositivo sin enviar texto a servidores externos, lo que resulta adecuado para escenarios con requisitos de privacidad.
- Accesibilidad para personas con discapacidad visual: conversión de texto de interfaces, correos o artículos a audio en inglés con un runtime ligero que puede empaquetarse junto a la aplicación.
- Generación de audio para contenido educativo o de formación: narración automatizada de materiales en inglés donde no se requiere clonación de voz ni voces personalizadas.
- Pruebas automatizadas de pipelines de voz: uso del modelo como componente TTS determinista en tests de integración de asistentes conversacionales, gracias a los hashes publicados que permiten verificar la integridad de los ficheros.
- Prototipado de interfaces de voz en entornos sin GPU: la cuantización int8 y el soporte de sherpa-onnx permiten ejecutar la síntesis en CPU, lo que facilita el desarrollo en portátiles o servidores sin acelerador dedicado.
- Empaquetado en aplicaciones de kiosco o domótica: anuncios de voz locales para sistemas embebidos con Linux, donde el peso del runtime y del modelo es un factor crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. El tamaño conjunto de los grafos ONNX es de aproximadamente 0,2 GB, por lo que la huella en memoria debería ser moderada, pero no se aportan cifras de consumo real.
- GPU recomendadas: no disponible. El modelo está pensado para inferencia mediante sherpa-onnx con ONNX Runtime, que soporta ejecución en CPU y en GPU (CUDA, DirectML, CoreML según build).
- ¿Cabe en GPU de consumo? No se especifica, pero por el tamaño del artefacto (0,2 GB) es plausible que quepa en GPUs de consumo; no obstante, no hay datos oficiales que lo confirmen.
- Opciones de despliegue: sherpa-onnx (librería principal), ONNX Runtime. No consta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hushfox Pocket TTS (English) | no disponible | no disponible | en | CC BY 4.0 | ONNX int8 | Exportación de kyutai/pocket-tts para sherpa-onnx |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | CC BY 4.0 | safetensors | Modelo base original de Kyutai |
| Alternativas TTS ligeras (p. ej. Piper, Coqui TTS) | no disponible | no disponible | varios | varía | ONNX / otros | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios específicos.
- Riesgo de alucinación o de pronunciación incorrecta en textos con nombres propios, siglas o términos técnicos: no evaluado en la documentación.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar a Kyutai como autor original y describir las modificaciones realizadas.
- Prohibición explícita de suplantación de voz y clonación sin consentimiento legal; el modelo no ofrece clonación de voz.
- Al ser una exportación con cuantización int8, puede existir una degradación de calidad respecto al modelo original en safetensors, no cuantificada en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No consta documentación sobre el proceso de entrenamiento, lo que dificulta evaluar riesgos de sesgo o de calidad en dominios concretos.
- La fecha de creación del repositorio (2026-11-05) es posterior a la fecha actual en muchos entornos; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alejandrocordon/hushfox-pocket-tts-en
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Herramienta de exportación: https://github.com/csukuangfj/pocket-tts-onnx-export
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- ONNX Runtime: https://onnxruntime.ai/
