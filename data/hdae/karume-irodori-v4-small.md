# hdae/karume-irodori-v4-small

## Resumen

Karume Irodori v4 Small es una distribución del modelo de síntesis de voz japonés Irodori-TTS v4 Small, convertido al formato de contenedor del runtime de inferencia WebGPU Karume. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión no oficial, realizada por el usuario hdae, que empaqueta los pesos originales de Aratako (modelo TTS basado en un DiT de flujo rectificado) junto con el backbone de texto ModernBERT japonés de SB Intuitions y el códec Semantic-DACVAE-Japanese-32dim, todo cuantizado y listo para ejecutarse en navegador y en Deno.

Su relevancia radica en que permite ejecutar un pipeline completo de text-to-speech japonés con clonación de voz y diseño de voz por descripción textual directamente en el cliente, sin backend ni GPU dedicada, gracias al runtime WebGPU. El repositorio ocupa 21,6 GB e incluye los nueve grafos que componen la cadena de inferencia (backbone, proyectores de condición, codificador de hablante, predictor de duración, DiT partido en contexto y paso de Euler, y códec en ambas direcciones).

La licencia es MIT para los pesos convertidos, con la salvedad de que los pesos del códec derivan de facebook/dacvae-watermarked bajo Apache-2.0. El modelo no está afiliado ni respaldado por Aratako ni por SB Intuitions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flujo rectificado y muestreo Euler; backbone de texto ModernBERT japonés; códec DACVAE |
| Parametros totales | no disponible (el backbone de texto es modernbert-ja-310m, 310M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32, f16, i8, i8-a8 (por defecto), i8+dit4 (DiT en i4 con calibración GPTQ) |
| Idiomas soportados | japonés (el backbone es ModernBERT-ja; el resto de idiomas no está documentado) |
| Licencia | MIT (componentes del códec bajo Apache-2.0) |
| Formato de pesos | contenedor Karume `.krm` (secuencia de partes con grafo y descriptores embebidos); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La cadena de inferencia se compone de nueve grafos: un backbone compartido ModernBERT japonés, dos proyectores de condición (`text_proj` y `caption_proj`), un codificador de hablante a partir de latentes de referencia, un predictor de duración, el DiT dividido en `dit_context` (claves y valores de condicionamiento, calculados una vez por generación) y `dit` (una pasada por paso de Euler, más una por rama de classifier-free guidance), y el códec DACVAE en sus variantes `codec_decoder` y `codec_encoder`. La generación es texto a forma de onda: `generate()` devuelve muestras mono en f32 a la frecuencia del códec, listas para `encodeWav`.

No hay reentrenamiento ni ajuste fino en esta conversión. Los cambios aplicados son de formato y compresión: cuantización de todos los componentes a series f32/f16/i8, con una serie i4 adicional para el DiT redondeada mediante calibración GPTQ; almacenamiento de las convoluciones con normalización de pesos como pesos efectivos; conservación únicamente de la mitad de media de `quantizer.in_proj` en el codificador; omisión de la rama de watermarking en el decodificador; y precomputación de subexpresiones constantes. El decodificador se ejecuta por teselas para respetar el límite por defecto de 128 MiB de buffer de almacenamiento en GPUs, y el resultado es bit-exacto frente a una decodificación de una sola pasada. El codificador, en cambio, no está teselado, por lo que una referencia larga puede superar ese límite.

## Capacidades

- Síntesis de voz japonesa a partir de texto, con salida de forma de onda mono en f32.
- Diseño de voz (voice design) mediante una descripción en prosa japonesa pasada como `caption`.
- Clonación de voz con audio de referencia en mono f32, o directamente con un latente DACVAE previamente guardado.
- Control de duración mediante un predictor dedicado dentro de la cadena.
- Ejecución en navegador y en Deno a través de WebGPU, sin backend de servidor.
- Selección de cuantización en tiempo de carga entre f16, f32, i8, i8+dit4 e i8-a8.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Lectura por voz de contenido japonés en aplicaciones web: el pipeline se ejecuta íntegramente en el navegador con WebGPU, de modo que un lector de artículos o un asistente de accesibilidad puede sintetizar voz sin enviar el texto a un servidor.
- Clonación de voz para doblaje o audiolibros: se pasa una muestra de referencia a 48 kHz y el modelo condiciona la generación sobre el latente del hablante, lo que permite mantener un timbre consistente en fragmentos largos procesados por separado.
- Diseño de voces para personajes en videojuegos o prototipos: la condición `caption` permite describir el estilo vocal en japonés (por ejemplo, una voz femenina calmada que habla despacio) sin necesidad de grabar referencias.
- Sistemas de aviso y notificación en aplicaciones japonesas: la generación local en el cliente evita dependencias de red y costes por petición en flujos de baja latencia.
- Herramientas de accesibilidad y lectura de pantalla: al ejecutarse en Deno o en el navegador, puede integrarse en aplicaciones de escritorio o extensiones sin infraestructura de inferencia propia.
- Pruebas de integración continua de pipelines de audio: el repositorio permite fijar una revisión concreta para builds reproducibles, y la cuantización i8-a8 por defecto reduce los requisitos de memoria en entornos de CI con GPU limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas de calidad de síntesis (MOS, similitud de hablante, error de prosodia) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- Inferencia orientada a WebGPU: GPU integrada o dedicada con soporte de WebGPU en el navegador o en Deno.
- El decodificador está teselado para ajustarse al límite por defecto de 128 MiB de buffer de almacenamiento, lo que amplía el rango de GPUs compatibles.
- El codificador de voz no está teselado: una referencia larga puede superar ese límite de 128 MiB y fallar.
- VRAM estimada: no disponible. El repositorio ocupa 21,6 GB, pero incluye todas las series de cuantización (f32, f16, i8, i4), por lo que el peso en memoria de una carga concreta depende de la cuantización seleccionada.
- Latencia y throughput: no disponibles.
- Opciones de despliegue: runtime Karume mediante `jsr:@karume/models` y el pipeline `irodori/1`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, y los pesos no son legibles por la implementación upstream de Irodori-TTS.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Karume Irodori v4 Small (este) | TTS DiT + DACVAE, cuantizado | no disponible | japonés | MIT (códec Apache-2.0) | Contenedor `.krm`, WebGPU/Deno |
| Aratako/Irodori-TTS-v4-Small | TTS DiT + DACVAE, pesos originales | no disponible | japonés | MIT | Checkpoint original, implementación PyTorch |
| Aratako/Semantic-DACVAE-Japanese-32dim | Códec neuronal (componente) | no aplica | japonés | MIT | Repositorio separado de pesos |
| sbintuitions/modernbert-ja-310m | Modelo de lenguaje enmascarado (backbone) | no disponible | japonés | MIT | Pesos Transformer estándar |

La comparación relevante es frente al checkpoint original de Irodori-TTS v4 Small: este repositorio no añade calidad, sino portabilidad y compresión, a costa de un formato propietario del runtime y de la pérdida de compatibilidad con el código upstream.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Aratako ni por SB Intuitions.
- Los pesos no son legibles por la implementación upstream; quedan atados al runtime Karume y al pipeline `irodori/1`.
- Solo se documenta soporte de japonés; el comportamiento con otros idiomas no está especificado.
- El audio de referencia debe estar ya a 48 kHz: no hay remuestreador y una frecuencia distinta se rechaza en lugar de convertirse.
- El codificador de voz no está teselado, por lo que referencias largas pueden exceder el límite de 128 MiB de buffer y fallar.
- La rama de watermarking del códec está desactivada en el decodificador; no se aplica marca de agua al audio generado.
- La cuantización i4 del DiT usa calibración GPTQ, lo que puede introducir degradación de calidad no cuantificada en la model card.
- Riesgo de alucinación y artefactos prosódicos inherente a los sistemas TTS: no se han publicado evaluaciones de fidelidad al texto de entrada.
- No se documentan sesgos demográficos ni de acento en las voces generadas.
- La licencia MIT permite uso comercial, pero los componentes del códec derivan de facebook/dacvae-watermarked (Apache-2.0), cuyos términos deben respetarse; el texto de Apache-2.0 se incluye en `LICENSE.md`.
- El repositorio no fija una revisión por defecto: sin especificar `revision`, se sigue `main` y una actualización futura puede romper la integración.

## Enlaces

- [hdae/karume-irodori-v4-small en Hugging Face](https://huggingface.co/hdae/karume-irodori-v4-small)
- [Aratako/Irodori-TTS-v4-Small](https://huggingface.co/Aratako/Irodori-TTS-v4-Small)
- [Aratako/Irodori-TTS (repositorio de implementación)](https://github.com/Aratako/Irodori-TTS)
- [Aratako/Semantic-DACVAE-Japanese-32dim](https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim)
- [sbintuitions/modernbert-ja-310m](https://huggingface.co/sbintuitions/modernbert-ja-310m)
- [facebook/dacvae-watermarked](https://huggingface.co/facebook/dacvae-watermarked)
- [Ficha en free2aitools](https://free2aitools.com/model/hdae/karume-irodori-v4-small)
