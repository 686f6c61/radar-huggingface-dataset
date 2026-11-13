# PowerBeef02/Qwen3-TTS-12Hz-1.7B-CustomVoice-hybrid-attn

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice-hybrid-attn es un artefacto de síntesis de voz (text-to-speech) publicado por el usuario PowerBeef02 dentro del proyecto Vocello. Se trata de una derivación de precisión mixta del modelo Qwen3-TTS de Alibaba (licencia Apache-2.0), construida tensor a tensor a partir de dos conversiones MLX del mismo modelo base: una cuantizada a 4 bits y otra a 8 bits. No se ha realizado recuantización alguna; los pesos se han ensamblado directamente desde ambos artefactos.

La particularidad del modelo es que mantiene la práctica totalidad de los tensores en 4 bits (afín, tamaño de grupo 64), pero sustituye las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del *talker* en sus 28 capas por las versiones en 8 bits. El resultado son aproximadamente 176 MB adicionales de pesos respecto al artefacto de 4 bits, con un coste de generación un 5 % superior. Según las mediciones del autor, mejora al modelo de 4 bits en clonación de voz, tomas individuales y proyectos de formato largo, aunque queda por debajo del modelo íntegramente en 8 bits en similitud de clonación y tasa de error en formato largo.

El modelo está pensado para ejecutarse en Apple Silicon mediante la librería `mlx-audio` y se distribuye en formato `safetensors`. El repositorio ocupa 2,2 GB y contiene 2.580.162.816 parámetros reales. Es relevante para desarrolladores que necesitan un TTS de calidad con huella de memoria reducida en hardware Apple, y que aceptan un compromiso medido entre velocidad y fidelidad de clonación. No incluye resultados de benchmarks objetivos publicados más allá de las pantallas automáticas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para TTS (Qwen3-TTS) con *talker* de 28 capas y *code predictor*; conversión MLX |
| Parametros totales | 2.580.162.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: 4 bits afín (grupo 64) en la mayoría de tensores; 8 bits afín (grupo 64) en `self_attn.q_proj`, `k_proj`, `v_proj`, `o_proj` del *talker* (28 capas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión a MLX de Qwen3-TTS, un sistema de síntesis de voz de Alibaba. La arquitectura interna incluye un componente denominado *talker* con 28 capas de atención, un *code predictor* y un tokenizador de voz (*speech tokenizer*). La variante "12Hz" hace referencia a la tasa de tokens de audio del tokenizador de voz. El modelo incorpora además el generador AudioSeal de Meta (licencia MIT) en el directorio `marking/`, utilizado para el marcado de audio generado.

El entrenamiento original corresponde a Qwen3-TTS y no se detalla en la información disponible. Esta publicación concreta no entrena ni ajusta el modelo: es un ensamblaje tensor a tensor de dos artefactos MLX ya existentes, sin recuantización. La innovación técnica es precisamente esa mezcla selectiva de precisiones: mantener las proyecciones de atención en 8 bits mientras el resto permanece en 4 bits, lo que según el autor mejora la calidad de clonación y la robustez en generación larga a cambio de un 5 % más de tiempo de generación. La selección de la configuración se realizó mediante pantallas automáticas con semillas fijas en un Mac, sin evaluación humana por escucha.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz (*custom voice*), según la denominación del modelo base.
- Generación de tomas individuales y de proyectos de formato largo.
- Marcado de audio generado mediante AudioSeal (Meta, MIT).
- Ejecución en Apple Silicon a través de `mlx-audio`.
- Soporte de tool calling, agentes, visión o audio de entrada: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Clonación de voz para locuciones: el modelo está optimizado para imitar una voz de referencia; su mezcla de precisión mejora la similitud de clonación respecto al artefacto de 4 bits, lo que lo hace adecuado para generar locuciones personalizadas en un Mac.
- Audiolibros y contenido de formato largo: el autor reporta mejor comportamiento que el modelo de 4 bits en proyectos largos, por lo que encaja en la generación de narraciones extensas donde la consistencia entre fragmentos es crítica.
- Prototipado de asistentes de voz en local: al ejecutarse con `mlx-audio` en Apple Silicon, permite iterar sobre experiencias conversacionales sin depender de servicios en la nube.
- Generación de voces para vídeos y pódcast: tomas individuales de calidad con un coste de generación solo un 5 % superior al modelo de 4 bits.
- Integración en pipelines de producción con trazabilidad: el catálogo de Vocello fija la revisión exacta y verifica cada archivo con SHA-256, lo que facilita despliegues reproducibles.
- Marcado y atribución de audio sintético: la inclusión del generador AudioSeal permite insertar marcas de agua en el audio generado para su identificación.
- Investigación sobre cuantización mixta en TTS: sirve como referencia práctica de cómo afecta mantener la atención en 8 bits frente a cuantizar todo a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta comparaciones cualitativas basadas en pantallas automáticas con semillas fijas: mejor que el modelo de 4 bits en clonación de voz, tomas individuales y formato largo, con aproximadamente un 5 % más de tiempo de generación; y peor que el modelo íntegramente en 8 bits en similitud de clonación y tasa de error en formato largo. Las mediciones detalladas se encuentran en `docs/reference/hybrid-model.md` del repositorio Vocello.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,2 GB; se requiere memoria unificada suficiente para cargar los pesos más el *speech tokenizer* y el generador AudioSeal. No se especifica un mínimo oficial.
- Hardware objetivo: Apple Silicon (MLX). No hay soporte indicado para GPU NVIDIA.
- GPU recomendadas: no disponible; el modelo está diseñado para Mac con chip Apple.
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual; está pensado para memoria unificada de equipos Apple.
- Opciones de despliegue: `mlx-audio` (librería declarada); el catálogo de Vocello lo consume fijando revisión y hashes. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; solo se conoce el dato relativo de un 5 % más de tiempo de generación frente al artefacto de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice-hybrid-attn (este) | 2.580.162.816 | Mixta 4/8 bits | Apache-2.0 | MLX (Apple Silicon) | Mejor que 4 bits en clonación y formato largo; +5 % tiempo |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit | no disponible | 4 bits afín (grupo 64) | Apache-2.0 | MLX (Apple Silicon) | Referencia base; peor calidad de clonación según el autor |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit | no disponible | 8 bits afín (grupo 64) | Apache-2.0 | MLX (Apple Silicon) | Mejor similitud de clonación y menor tasa de error en formato largo; mayor huella |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La selección de la configuración se hizo con pantallas automáticas y semillas fijas, sin escucha humana; la calidad percibida no ha sido validada subjetivamente.
- El modelo es peor que el artefacto íntegramente en 8 bits en similitud de clonación y en tasa de error para formato largo.
- El tiempo de generación es aproximadamente un 5 % superior al del modelo de 4 bits.
- Solo está pensado para MLX en Apple Silicon; no hay soporte indicado para otras plataformas.
- Idiomas soportados y longitud de contexto no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- La clonación de voz conlleva riesgos de suplantación y uso indebido; el modelo incluye AudioSeal para marcado, pero su eficacia depende de que el pipeline lo aplique.
- Aunque la licencia es Apache-2.0, el uso comercial de la clonación de voces puede estar sujeto a normativa sobre derechos de imagen y voz; conviene verificar el cumplimiento legal.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-CustomVoice-hybrid-attn
- Modelo base 4 bits: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit
- Modelo base 8 bits: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit
- Repositorio Vocello: https://github.com/PowerBeef/Vocello
- Mediciones del modelo híbrido: `docs/reference/hybrid-model.md` en el repositorio Vocello
