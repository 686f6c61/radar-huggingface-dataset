# Phoonnx/vits-lb_lu-androgynous

## Resumen

vits-lb_lu-androgynous es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por mbarnig y empaquetado por Phoonnx para su librería de inferencia ONNX `phoonnx`. El modelo genera audio a partir de texto en luxemburgués (lb-LU) con una voz de timbre andrógino, y se distribuye como un artefacto ONNX listo para producción, no como pesos de entrenamiento.

El modelo resuelve un caso de uso muy específico: la síntesis de voz en una lengua minoritaria europea con pocos recursos, el luxemburgués, para la que existen muy pocas alternativas TTS de calidad. Su empaquetado para `phoonnx` y su integración con OVOS lo orientan a asistentes de voz locales y autoalojados, no a servicios comerciales de gran escala.

La relevancia actual radica en su formato ONNX ligero (0,1 GB de repositorio) y su licencia CC-BY-4.0, que permite uso comercial con atribución. No es un modelo de propósito general ni compite en benchmarks de razonamiento: es una pieza de infraestructura TTS para una lengua concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | luxemburgués (lb-LU) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Autor original | mbarnig |
| Empaquetador | Phoonnx |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx (Python y OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de un alineamiento monotónico latente. Este diseño permite generar audio de forma directa desde fonemas sin un modelo acústico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue.

El modelo original procede del repositorio `mbarnig/lb_rhasspy_piper_tts`, en la ruta `lb/lb_LU/androgynous/medium`, lo que indica que fue entrenado en el ecosistema Piper/Rhasspy para TTS de bajo consumo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovación destacable es el empaquetado para `phoonnx`, que estandariza la inferencia ONNX y el front-end de fonemización mediante `scriptconv` y espeak-ng.

## Capacidades

- Síntesis de voz (text-to-speech) en luxemburgués (lb-LU) a partir de texto plano.
- Fonemización mediante espeak-ng (o el port espyak) y conversión a alfabeto IPA antes de la inferencia.
- Generación de audio WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- Voz de timbre andrógino (variante "androgynous" del modelo upstream).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al luxemburgués.

## Casos de uso

- Asistentes de voz locales en luxemburgués: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dar respuesta hablada a un asistente doméstico autoalojado, aprovechando que el modelo corre en ONNX y no requiere servicios en la nube.
- Lectura de contenido en luxemburgués: conversión de artículos, noticias o documentación a audio para accesibilidad o consumo pasivo, usando la API `synthesize_wav` sobre texto normalizado por `scriptconv`.
- Señalización y anuncios en transporte o espacios públicos: generación de avisos pregrabados o dinámicos en luxemburgués para paneles y megafonía, donde la licencia CC-BY-4.0 permite uso comercial con atribución.
- Preservación y promoción de lenguas minoritarias: creación de material educativo o divulgativo en luxemburgués con una voz sintética neutra, útil para proyectos de documentación lingüística.
- Prototipado de interfaces de voz en navegador: uso de `phoonnx.js` y la demo de TigreGotico para probar la voz en aplicaciones web sin backend, con entrada espeak o unicode.
- Aplicaciones de lectura para personas con discapacidad visual: integración en lectores de pantalla o herramientas de accesibilidad que necesiten una voz luxemburguesa local y de bajo consumo.
- Generación de audio para pruebas de pipelines TTS: validación de front-ends de fonemización y de integración ONNX en entornos de CI, dado el pequeño tamaño del repositorio (0,1 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS "medium", se espera un consumo bajo, apto para CPU.
- GPU recomendadas: no se documentan; el modelo está pensado para inferencia ONNX en CPU y entornos embebidos.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-lb_lu-androgynous (este) | VITS | lb-LU | no aplica | CC-BY-4.0 | ONNX | Hugging Face, phoonnx, OVOS |
| mbarnig/lb_rhasspy_piper_tts (upstream) | VITS (Piper) | lb-LU | no aplica | CC-BY-4.0 | Piper/ONNX | Hugging Face |
| Otros VITS de la colección Phoonnx | VITS | varias | no aplica | según modelo | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz sintética entrenada con datos limitados de luxemburgués, puede presentar sesgos de pronunciación o prosodia en registros no representados.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas o artefactos de audio, especialmente con palabras fuera del vocabulario o nombres propios.
- Dependencia de espeak-ng: la fonemización requiere espeak-ng instalado; el port espyak puede producir fonemas distintos y provocar errores de pronunciación.
- Limitación de idioma: solo luxemburgués (lb-LU); no es multilingüe.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar al autor y mantener el aviso de licencia.
- Caveat de producción: el modelo tiene solo 25 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación comunitaria; conviene evaluar la calidad de audio antes de desplegarlo.
- No se documentan parámetros totales, cuantizaciones ni métricas de latencia, lo que dificulta el dimensionamiento previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lb_lu-androgynous
- Modelo upstream: https://huggingface.co/mbarnig/lb_rhasspy_piper_tts/tree/main/lb/lb_LU/androgynous/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
