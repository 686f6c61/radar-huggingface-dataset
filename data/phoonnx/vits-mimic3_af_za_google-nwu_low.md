# Phoonnx/vits-mimic3_af_ZA_google-nwu_low

## Resumen

`vits-mimic3_af_ZA_google-nwu_low` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del repositorio agregador `Phoonnx/phoonnx-vits`, que a su vez empaqueta voces del proyecto Mimic3. El modelo corresponde a la voz `google-nwu_low` para afrikáans de Sudáfrica (`af_ZA`), con identificador interno `mimic3/af_ZA/google-nwu_low` en el ecosistema phoonnx.

Técnicamente se trata de una red VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) exportada a ONNX para inferencia ligera y multiplataforma. La etiqueta `_low` indica una variante de calidad reducida, pensada para entornos con recursos limitados o para síntesis de baja latencia. El tamaño del repositorio es de 0,1 GB, lo que confirma un modelo compacto orientado a despliegue en dispositivos modestos.

Su relevancia es acotada pero concreta: cubre una combinación de idioma y calidad poco frecuente (afrikáans, calidad baja) dentro de un formato estandarizado (ONNX) y con licencia MIT, lo que facilita su integración en pipelines de TTS sin dependencias de frameworks pesados. No obstante, la información publicada por el autor es mínima y no incluye especificaciones detalladas de arquitectura, entrenamiento ni evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | afrikáans (`af_ZA`, según el identificador del modelo) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta, con alineamiento monotónico aprendido (MAS) y decodificación por flujo normalizador. Esta familia de modelos genera audio directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue.

La información disponible no detalla el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste fino adicionales. La procedencia es la voz `google-nwu_low` del proyecto Mimic3, empaquetada en el repositorio `Phoonnx/phoonnx-vits` y reexportada a ONNX para su uso con la librería phoonnx. La etiqueta `_low` sugiere una variante de menor calidad o menor coste computacional dentro de la familia de voces Mimic3, pero no se documentan los detalles de esa configuración.

## Capacidades

- Síntesis de voz a partir de texto en afrikáans (`af_ZA`).
- Generación de audio end-to-end mediante arquitectura VITS, sin vocoder externo.
- Inferencia en formato ONNX, compatible con runtimes ONNX estándar.
- Integración con la librería phoonnx mediante el identificador de voz `mimic3/af_ZA/google-nwu_low`.
- Variante de calidad baja (`_low`), orientada a eficiencia y recursos limitados.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- **Lectura de contenido en afrikáans**: convertir artículos, noticias o documentación a audio para usuarios sudafricanos, aprovechando que el modelo cubre una lengua con poca cobertura TTS comercial.
- **Accesibilidad en aplicaciones locales**: integrar síntesis de voz en lectores de pantalla o asistentes para personas con discapacidad visual que usen afrikáans, con un modelo ligero (0,1 GB) fácil de empaquetar.
- **Sistemas embebidos y de bajo consumo**: desplegar TTS en dispositivos con recursos limitados gracias al formato ONNX y a la variante `_low`, que reduce el coste computacional frente a voces de mayor calidad.
- **Generación de avisos automatizados**: producir mensajes de voz para sistemas de transporte, emergencias o atención telefónica en afrikáans, donde la naturalidad extrema no es crítica.
- **Prototipado e investigación en TTS de bajos recursos**: usar el modelo como línea base para experimentos con lenguas de bajos recursos, dado su tamaño reducido y licencia permisiva.
- **Pipelines de datos sintéticos de audio**: generar muestras de voz en afrikáans para aumentar corpus de entrenamiento de otros sistemas de reconocimiento de voz o de TTS.
- **Integración en aplicaciones phoonnx**: incorporar la voz directamente en proyectos que ya usan la librería phoonnx mediante el identificador `mimic3/af_ZA/google-nwu_low`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera un consumo de memoria muy bajo, del orden de unos pocos cientos de MB durante la inferencia.
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere hardware de gama alta.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), phoonnx como librería de integración; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- **Latencia y throughput**: no disponibles; la variante `_low` sugiere una latencia reducida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño |
|---|---|---|---|---|---|
| `Phoonnx/vits-mimic3_af_ZA_google-nwu_low` | VITS (ONNX) | afrikáans | ONNX | MIT | 0,1 GB |
| Otras voces de `Phoonnx/phoonnx-vits` | VITS (ONNX) | varios (p. ej. tw, ny, vmw) | ONNX | según subcarpeta | variable |
| Voces Piper (p. ej. `kasanoma`) | VITS (ONNX) | tw, ny, vmw | ONNX | other (sin licencia declarada) | variable |
| Voces Mimic3 originales | VITS | varias | varios | según origen | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Calidad reducida**: la etiqueta `_low` indica una variante de menor calidad; la naturalidad y prosodia pueden ser inferiores a las de voces de mayor gama.
- **Cobertura lingüística limitada**: solo afrikáans (`af_ZA`); no se documenta soporte multilingüe.
- **Documentación escasa**: no hay datos sobre parámetros, entrenamiento, evaluación ni sesgos conocidos.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en texto fuera de dominio, aunque no se documenta específicamente.
- **Licencia**: MIT, lo que permite uso comercial; sin embargo, conviene verificar la procedencia de la voz original (`google-nwu_low` de Mimic3) por si el corpus de origen impone restricciones adicionales.
- **Formato**: al ser ONNX, requiere un runtime compatible; no es directamente utilizable en frameworks como PyTorch sin conversión.
- **Sin garantías de producción**: no se documentan pruebas de robustez, latencia ni estabilidad en entornos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-mimic3_af_ZA_google-nwu_low)
- [Repositorio agregador Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Repositorio kasanoma (referencia de voces Piper)](https://github.com/michsethowusu/kasanoma)
