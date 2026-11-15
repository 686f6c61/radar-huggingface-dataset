# Phoonnx/coqui-vits-lin-openbible-vits

## Resumen

Phoonnx/coqui-vits-lin-openbible-vits es un modelo de síntesis de voz (text-to-speech) derivado de `coqui/lin-openbible-vits`, empaquetado en formato ONNX para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una extracción de una carpeta concreta del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que reúne múltiples voces del ecosistema Coqui VITS convertidas a ONNX. El modelo se publica bajo licencia CC-BY-SA-4.0 y está pensado para inferencia ligera sin dependencia del runtime original de Coqui TTS.

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador vocacional basado en HiFi-GAN, todo entrenado de forma adversarial junto con un discriminador. El identificador de voz `lin` y la etiqueta `OpenBible` sugieren que el modelo se entrenó con datos de audio de lectura bíblica en el corpus OpenBible, lo que condiciona su dominio acústico y su prosodia.

El interés práctico del modelo es acotado pero claro: ofrece una voz TTS concreta en un formato portable (ONNX) que puede ejecutarse en CPU o GPU sin necesidad de instalar el stack completo de Coqui, lo que facilita su integración en aplicaciones de lectura de texto, audiolibros o pipelines de accesibilidad. No obstante, la información pública es muy escasa: no hay datos de entrenamiento, benchmarks ni idiomas declarados, y el modelo no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con flujo normalizador y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; cuantizacion no documentada) |
| Idiomas soportados | no disponible (la etiqueta `ln` del repositorio origen sugiere una lengua concreta, sin confirmar) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0.1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que integra en un único modelo un codificador de texto, un predictor de duraciones (con alineamiento monotónico aprendido de forma variacional), un flujo normalizador que modela la distribución latente condicionada al texto, y un decodificador vocacional del tipo HiFi-GAN. El entrenamiento se realiza de forma adversarial con un discriminador multiperiodo, combinando pérdidas de reconstrucción, pérdida adversarial, pérdida de duración y pérdida KL sobre el flujo. El resultado es un modelo que genera waveforms directamente desde texto sin necesidad de vocoder externo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales. La etiqueta `OpenBible` en el nombre sugiere que los datos provienen de grabaciones de lectura bíblica del corpus OpenBible, lo que implicaría un dominio acústico limitado a lectura en voz alta con prosodia relativamente plana. La conversión a ONNX la realiza el proyecto phoonnx, que exporta los checkpoints de Coqui VITS para su ejecución con ONNX Runtime.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con salida de waveform.
- Voz concreta identificada como `coqui/lin-openbible-vits` en el ecosistema phoonnx.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU y GPU.
- Integración con la librería phoonnx mediante el voice id `coqui/lin-openbible-vits`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Cobertura multilingüe: no disponible; la voz está asociada a un único perfil acústico.

## Casos de uso

- Lectura de texto en voz alta para aplicaciones de accesibilidad: el modelo puede convertir artículos, notificaciones o documentos en audio, ejecutándose en ONNX Runtime en dispositivos sin GPU dedicada gracias al reducido tamaño del repositorio (0.1 GB).
- Generación de audiolibros y contenido narrado: al estar entrenado sobre lectura bíblica (OpenBible), encaja especialmente bien en narración de textos religiosos o de lectura continua con prosodia estable.
- Pre-generación de avisos y mensajes de voz en sistemas embebidos: la exportación ONNX permite desplegar la síntesis en entornos con recursos limitados (Raspberry Pi, dispositivos edge) sin el stack de Coqui.
- Prototipado rápido de interfaces de voz: el voice id `coqui/lin-openbible-vits` permite integrar la voz en una aplicación phoonnx con unas pocas líneas de código para validar flujos de TTS antes de invertir en un modelo propio.
- Síntesis por lotes en pipelines de datos: la inferencia ONNX permite procesar grandes volúmenes de texto a audio en servidores CPU para generar datasets de audio sintético o doblaje de contenido.
- Investigación en TTS y comparación de voces: al ser una extracción de un repositorio agregador de voces Coqui VITS, sirve como punto de comparación reproducible entre distintas voces del ecosistema phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0.1 GB) sugiere que el modelo cabe holgadamente en memoria de cualquier GPU consumer, aunque no se especifica el consumo exacto.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, GTX 1650 o superiores), aunque no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Contexto / idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-lin-openbible-vits | VITS | ONNX | CC-BY-SA-4.0 | no disponible | Hugging Face (0 descargas) |
| coqui/lin-openbible-vits (origen) | VITS | Coqui checkpoint | CC-BY-SA-4.0 | no disponible | Repositorio Coqui |
| Otras voces de Phoonnx/phoonnx-coqui-vits | VITS | ONNX | según voz de origen | variable | Hugging Face |
| Coqui TTS voces multilingües (p. ej. VITS multilingüe) | VITS | Coqui checkpoint | MPL-2.0 / variable | multilingüe | Coqui TTS |

La comparación cuantitativa con alternativas no es posible porque no se han publicado métricas objetivas (MOS, RTF, WER) ni datos de parámetros para este modelo ni para las voces comparables en la información disponible.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, dataset, idiomas ni métricas, lo que dificulta evaluar su calidad antes de desplegarlo.
- Dominio acústico restringido: el nombre `OpenBible` sugiere entrenamiento sobre lectura bíblica, por lo que la prosodia puede sonar poco natural en textos conversacionales, técnicos o con puntuación atípica.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas y neologismos.
- Idiomas soportados no confirmados: la etiqueta `ln` del repositorio origen no está documentada y no debe asumirse como código ISO de idioma sin verificación.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar la distribución de productos que incorporen el modelo o sus salidas.
- Sin descargas ni likes registrados: no hay evidencia de validación por parte de la comunidad.
- No es un modelo de lenguaje: no admite instrucciones, tool calling ni razonamiento; su única función es la síntesis de voz.
- Posibles sesgos acústicos derivados del corpus de entrenamiento (voz única, registro de lectura, posible sesgo de género y de dominio).

## Enlaces

- [Hugging Face: Phoonnx/coqui-vits-lin-openbible-vits](https://huggingface.co/Phoonnx/coqui-vits-lin-openbible-vits)
- [Repositorio agregador: Phoonnx/phoonnx-coqui-vits](https://huggingface.co/Phoonnx/phoonnx-coqui-vits)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Modelo origen: coqui/lin-openbible-vits](https://huggingface.co/coqui/lin-openbible-vits)
- [Paper VITS (arXiv:2106.06103)](https://arxiv.org/abs/2106.06103)
