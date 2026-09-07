# bgdv99/av-ste

## Resumen

AV-STE (Audio-Visual Speech Token Enhancement) es un modelo de mejora de tokens de voz desarrollado por bgdv99 (Bella Godiva) y presentado en EMNLP 2026. Su objetivo es recuperar tokens semánticos de Mimi limpios a partir de voz ruidosa, fusionando características de audio con video de la región de interés de los labios mediante un módulo de atención cruzada con compuerta de entropía construido sobre AV-HuBERT. Los tokens mejorados pueden alimentar directamente cualquier TTS o codec LM basado en Mimi, como Moshi, sustituyendo a los tokens ruidosos. El modelo se presenta como una solución para sistemas de diálogo hablado full-duplex en entornos con ruido e interferencias. El repositorio incluye dos checkpoints de fairseq (`avste.pt` y `avste_lrs3_interference.pt`) con un tamaño total de 8.0 GB, pero no se especifica el número de parámetros ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AV-HuBERT (backbone) + módulo de atención cruzada con compuerta de entropía para fusión audio-visual |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | .pt (checkpoints de fairseq) |

## Arquitectura y entrenamiento

AV-STE se construye sobre el backbone AV-HuBERT-Large (VoxCeleb2), al que se añade un módulo de atención cruzada con compuerta de entropía. Este módulo fusiona características de audio con video de labios (lip-ROI) para recuperar tokens semánticos de Mimi limpios a partir de audio ruidoso. El modelo está diseñado para funcionar en streaming, adaptándose al ruido de forma adaptativa. Los pesos se obtuvieron mediante fine-tuning en el dataset LRS3 (con licencia restringida) y con aumento de ruido e interferencias procedentes de AudioSet. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El repositorio no redistribuye datos de entrenamiento ni evaluación, solo los parámetros del modelo.

## Capacidades

- Mejora de tokens semánticos de voz: recupera tokens Mimi limpios a partir de audio con ruido de fondo o interferencias.
- Fusión audio-visual: utiliza video de la región de los labios para mejorar la precisión de la recuperación de tokens.
- Compatibilidad con modelos Mimi: los tokens mejorados pueden sustituir a los tokens ruidosos en TTS o codec LM basados en Mimi, como Moshi.
- Dos variantes de checkpoint: `avste.pt` para ruido no relacionado con el habla e interferencia entre hablantes de cross-dataset; `avste_lrs3_interference.pt` para hablantes competidores del mismo corpus y video fuera de dominio.
- Diseñado para streaming full-duplex: pensado para sistemas de diálogo hablado en tiempo real, aunque no se detalla la latencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multistep ni soporte multilingüe explícito.

## Casos de uso

- Mejora de voz en sistemas de diálogo hablado full-duplex: el modelo se coloca antes de un TTS o codec LM basado en Mimi (por ejemplo, Moshi) para limpiar los tokens semánticos en tiempo real, reduciendo el impacto del ruido en conversaciones bidireccionales.
- Videollamadas con ruido de fondo: al disponer del video de los labios, AV-STE puede mejorar la señal de voz en entornos ruidosos, lo que resulta útil en aplicaciones de comunicación por vídeo.
- Asistentes de voz en entornos con múltiples hablantes: la variante `avste_lrs3_interference.pt` está diseñada para manejar interferencias de hablantes competidores, mejorando la robustez en escenarios de reuniones o espacios compartidos.
- Post-procesado de grabaciones audiovisuales: los tokens mejorados pueden utilizarse para regenerar voz limpia en grabaciones con ruido, antes de un paso de síntesis o transcripción.
- Investigación en modelos de habla multimodal: sirve como componente de referencia para estudiar la fusión de audio y vídeo en la generación de tokens semánticos, especialmente en pipelines de codec LM.
- Integración en pipelines de TTS robustos: al sustituir los tokens ruidosos por tokens mejorados, se puede aumentar la calidad de la síntesis de voz en aplicaciones de voz sintética que dependen de un codec como Mimi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los dos checkpoints reproducen las filas de precisión de tokens semánticos de la tabla principal del paper de EMNLP 2026, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se carga mediante fairseq (`checkpoint_utils.load_model_ensemble_and_task`) y requiere el backbone AV-HuBERT-Large (`large_vox_iter5.pt`) descargado por separado. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. AV-STE es un modelo específico de mejora de tokens de voz audio-visual, y no se han encontrado alternativas de la misma categoría con datos suficientes para una comparación.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica licencia, lo que genera incertidumbre sobre el uso comercial.
- Dependencia de un backbone externo: los checkpoints requieren `large_vox_iter5.pt` (AV-HuBERT-Large VoxCeleb2), que no está incluido en el repositorio y debe descargarse desde su fuente original.
- Datos de entrenamiento con licencia restringida: el fine-tuning se realizó sobre LRS3, que tiene licencia restringida, y no se redistribuyen los datos.
- Idiomas no especificados: no se indica qué idiomas soporta; el dataset LRS3 sugiere inglés, pero no es confirmado.
- Sin benchmarks numéricos: no se proporcionan métricas de rendimiento, lo que dificulta la evaluación comparativa.
- Dependencia de la entrada de vídeo: el modelo requiere video de la región de los labios; si el vídeo no está disponible o es de baja calidad, la mejora podría degradarse.
- Tamaño del repositorio: 8.0 GB, lo que puede limitar el despliegue en dispositivos con recursos reducidos.

## Enlaces

- HuggingFace: https://huggingface.co/bgdv99/av-ste
- Repositorio GitHub: https://github.com/bellagodiva/av-ste
- Documentación de checkpoints: https://github.com/bellagodiva/av-ste/blob/master/checkpoints/README.md
- Perfil del autor en HuggingFace: https://huggingface.co/bgdv99
