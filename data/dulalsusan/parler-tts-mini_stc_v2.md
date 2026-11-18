# dulalSusan/parler-tts-mini_stc_v2

## Resumen

`dulalSusan/parler-tts-mini_stc_v2` es un modelo de síntesis de voz (text-to-audio) publicado en Hugging Face por el usuario dulalSusan. Según los metadatos del repositorio, está construido sobre la arquitectura VITS (etiqueta `vits` en el Hub) y se distribuye en formato `safetensors` con compatibilidad para la librería `transformers` y para `endpoints_compatible`. El nombre sugiere una variante reducida ("mini") del modelo Parler-TTS, aunque la model card no confirma esa filiación ni documenta el proceso de entrenamiento.

El modelo cuenta con 42.445.872 parámetros (aproximadamente 42,4 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de modelos TTS ligeros, aptos para inferencia en CPU o GPU de consumo. La referencia bibliográfica incluida en los tags (`arxiv:1910.09700`) corresponde al artículo de Lacoste et al. sobre el cálculo de impacto ambiental en machine learning, no a un paper técnico del modelo, por lo que no aporta información sobre su arquitectura o entrenamiento.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la existente es la plantilla autogenerada por Hugging Face con campos "[More Information Needed]"), sin licencia declarada y sin idiomas especificados. Cualquier evaluación rigurosa queda condicionada por esa ausencia de documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (según tag del Hub); detalles no disponibles |
| Parametros totales | 42.445.872 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-audio; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El único dato arquitectónico fiable es la etiqueta `vits` del repositorio, que apunta a la familia VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un encoder de texto, un predictor de duración, un flujo normalizador y un decoder basado en HiFi-GAN, entrenado con pérdidas adversarias y de reconstrucción. No obstante, la model card no confirma esta arquitectura ni describe variantes, por lo que la atribución debe tomarse como indicio y no como hecho verificado.

No hay información sobre el corpus de entrenamiento, el número de tokens o horas de audio, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). La model card es la plantilla estándar autogenerada y todos los campos relevantes figuran como "[More Information Needed]". El nombre del repositorio (`parler-tts-mini_stc_v2`) sugiere un fine-tuning o destilado de Parler-TTS, pero no se aporta evidencia documental.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-audio`), presumiblemente con salida de audio en formato waveform.
- No hay evidencia documentada de control de estilo, emoción, hablante o prosodia.
- No hay evidencia de soporte de tool calling ni function calling (no aplica a un modelo TTS).
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se especifica ningún idioma.
- No se documentan modos especiales (thinking, visión, audio de entrada, etc.).

## Casos de uso

- Lectura de artículos y documentos: dado su tamaño reducido (42,4 M de parámetros), puede desplegarse en un servicio ligero que convierta texto plano en audio para lectores de pantalla o podcasts automáticos, siempre que se valide la calidad de la voz generada.
- Prototipado de interfaces de voz: útil para pruebas de concepto en asistentes conversacionales donde se necesita un TTS de bajo coste computacional antes de migrar a un modelo comercial.
- Generación de avisos y notificaciones habladas: integrable en sistemas de alertas (domótica, accesibilidad) que requieran convertir mensajes cortos en audio en tiempo casi real.
- Accesibilidad web: conversión de contenido textual de páginas a audio para usuarios con discapacidad visual, aprovechando el reducido footprint del modelo para ejecutarse en el navegador o en el servidor.
- Investigación y experimentación en TTS: base para fine-tuning o comparación de arquitecturas ligeras en entornos académicos con recursos limitados.
- Pruebas de pipelines de audio en `transformers`: validación de integración con `pipeline("text-to-audio")` y con endpoints de Hugging Face antes de adoptar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 42,4 M de parámetros, en fp32 ocuparía aproximadamente 170 MB de pesos, y en fp16 unos 85 MB, más overhead de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería ser suficiente; no hay datos de rendimiento medidos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas, aunque no se ha verificado.
- Opciones de despliegue: `transformers` (pipeline `text-to-audio`), endpoints de Hugging Face (tag `endpoints_compatible`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y, en el caso de llama.cpp/Ollama, no aplica a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dulalSusan/parler-tts-mini_stc_v2 | 42,4 M | No aplica | No disponible | Hugging Face (0 descargas) |
| Parler-TTS (variantes oficiales) | No disponible en esta consulta | No aplica | No disponible en esta consulta | Hugging Face |
| VITS (implementaciones de referencia) | Variable según implementación | No aplica | Variable según implementación | Repositorios públicos |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) para establecer una comparación cuantitativa con alternativas. La comparativa anterior es meramente descriptiva y se basa en la categoría del modelo, no en mediciones.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: todos los campos de la plantilla están sin rellenar, lo que impide conocer el proceso de entrenamiento y validar el modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no especificados: se desconoce si el modelo sintetiza castellano, inglés u otros idiomas, y con qué calidad.
- Riesgo de alucinación y artefactos acústicos: sin evaluación publicada, no se puede descartar que el audio generado contenga ruido, prosodia incorrecta o pronunciación errónea.
- Sesgos potenciales: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de hablante, género o acento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de calidad.
- Fecha de creación anómala (2026-11-18) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.
- No apto para producción sin validación previa: la falta de benchmarks, licencia e idiomas documentados hace imprescindible una evaluación propia (MOS subjetivo, inteligibilidad, latencia) antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/dulalSusan/parler-tts-mini_stc_v2
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
