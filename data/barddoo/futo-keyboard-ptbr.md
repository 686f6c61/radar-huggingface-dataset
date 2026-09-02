# barddoo/futo-keyboard-ptbr

## Resumen

`futo-keyboard-ptbr` es un modelo de lenguaje neuronal pequeño y especializado, desarrollado por el autor independiente barddoo, diseñado para integrarse en FUTO Keyboard, un teclado para Android que prioriza la privacidad y funciona completamente sin conexión a internet. El modelo se encarga de la predicción de la siguiente palabra, la autocorrección y el soporte de gestos de deslizamiento (swipe typing) en portugués de Brasil (pt-BR), ejecutándose íntegramente en el dispositivo.

Se trata de un modelo decoder-only con arquitectura tipo `llama` (similar a GPT), con aproximadamente 50 millones de parámetros según los pesos en safetensors (la model card indica ~42 millones) y una ventana de contexto de 256 tokens. Su relevancia actual radica en que demuestra cómo modelos de muy pequeño tamaño pueden ofrecer funcionalidades de teclado predictivo de alta calidad, respetando la privacidad del usuario y con requisitos de hardware mínimos, en un momento en el que la industria tiende a soluciones basadas en la nube o en modelos mucho más grandes.

El modelo se distribuye en formato GGUF con dos niveles de cuantización (Q6_K y F32), bajo licencia Apache-2.0, y está pensado para ser importado directamente en FUTO Keyboard mediante su sistema de gestión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only tipo `llama` (RMSNorm, RoPE θ=10000, FFN con activación SiLU, lm_head atado) |
| Parametros totales | 49.947.136 (según safetensors; la model card indica ~42M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Q6_K (~40 MB), F32 (~191 MB) |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repo) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, con 8 capas, 8 cabezas de atención, dimensión de embedding de 512 y un vocabulario de 16.000 tokens creado con SentencePiece BPE (con espacio invertido y fallback a bytes). El tokenizador está incrustado en el propio modelo a través de `keyboardlm.ext_tokenizer_data`, lo que facilita su uso en el runtime de FUTO Keyboard. Una característica destacada es el soporte de `char_embed_mixing_v1`, que combina embeddings a nivel de carácter y de token para mejorar la autocorrección y el reconocimiento de gestos de deslizamiento.

El entrenamiento se realizó desde cero (no es un fine-tune, `finetuning_count = 0`) sobre un corpus limpio de portugués brasileño que incluye el subconjunto real de MADRAS1 corpus-ptbr, Wikipedia en portugués y Pt-Corpus-Instruct. El objetivo de entrenamiento es la predicción causal del siguiente token sobre secuencias formadas por `[BOS] + encode(linea + " ")`, replicando la tokenización que el runtime de FUTO Keyboard aplica en producción. El proceso se llevó a cabo con hardware NVIDIA CUDA, AMD ROCm o Apple MPS, aunque no se especifican el número de tokens de entrenamiento ni la duración exacta.

## Capacidades

- Predicción de la siguiente palabra en tiempo real para portugués brasileño, adaptada a la tokenización específica del runtime de FUTO Keyboard.
- Autocorrección de texto, basada en la característica `xbu_char_autocorrect_v1` que opera sobre caracteres y tokens.
- Soporte de escritura por gestos de deslizamiento (swipe typing) mediante la característica `xc0_swipe_typing_v1`.
- Funcionamiento completamente offline y en el dispositivo, sin necesidad de conexión a internet ni de servidores externos.
- Compatibilidad con el sistema de importación de modelos de FUTO Keyboard (archivo `.gguf`).
- Vocabulario restringido a 16.000 tokens, optimizado para el dominio del teclado y la lengua portuguesa.

## Casos de uso

- **Teclado predictivo en Android**: el caso principal es integrar el modelo en FUTO Keyboard para ofrecer sugerencias de la siguiente palabra mientras el usuario escribe mensajes, correos o notas, sin enviar datos a la nube.
- **Autocorrección en aplicaciones de mensajería**: al escribir en WhatsApp, Telegram u otras apps, el modelo corrige automáticamente errores tipográficos comunes en portugués brasileño, mejorando la velocidad y precisión de escritura.
- **Escritura por deslizamiento (swipe typing)**: permite al usuario deslizar el dedo sobre las letras para formar palabras, con el modelo interpretando el patrón de gestos y generando la palabra más probable.
- **Dispositivos de gama baja**: gracias a su tamaño reducido (el archivo Q6_K ocupa unos 40 MB), el modelo puede ejecutarse en smartphones con poca memoria RAM y CPU modestas, ofreciendo una experiencia de teclado inteligente sin necesidad de hardware avanzado.
- **Entornos con restricciones de privacidad**: organizaciones o usuarios individuales que requieran que la entrada de texto no salga del dispositivo pueden desplegar este modelo como alternativa a los teclados predictivos basados en la nube (por ejemplo, Gboard).
- **Investigación y desarrollo**: el modelo y su pipeline de entrenamiento (disponible en el repositorio fuente) sirven como punto de partida para experimentar con modelos de lenguaje de pequeño tamaño para tareas de interfaz de usuario, o para adaptar el enfoque a otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como perplejidad, precisión de predicción o tasas de error en comparación con otros modelos de teclado. El artículo de AI Beat menciona que los modelos de swipe de FUTO (de 2,5 millones de parámetros) logran un 26 % menos de errores que Gboard en su propio benchmark, pero ese dato corresponde a otro modelo distinto del que aquí se documenta, por lo que no es extrapolable.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 100 MB en la cuantización Q6_K (el archivo pesa ~40 MB, y la memoria adicional para activaciones es mínima dado el contexto de 256 tokens y las 8 capas).
- **GPU recomendadas**: ninguna. El modelo está diseñado para ejecutarse en CPU de dispositivos móviles. En un PC, cualquier CPU moderna es suficiente; en Android, funciona en procesadores ARM de gama baja.
- **Compatibilidad con GPU de consumo**: sí, pero no es necesario. Si se desea ejecutar en una GPU de escritorio (por ejemplo, para pruebas), cualquier GPU con al menos 1 GB de VRAM (como una GTX 1050 o superior) sería más que suficiente.
- **Opciones de despliegue**: integración directa en FUTO Keyboard (importando el `.gguf`), o mediante llama.cpp en cualquier plataforma que soporte la arquitectura `llama`. No se menciona compatibilidad con vLLM, Ollama o TGI, aunque al ser un modelo GGUF estándar podría usarse con llama.cpp.
- **Latencia y throughput**: no se han publicado mediciones oficiales, pero por el tamaño del modelo y la longitud de contexto, la inferencia debería completarse en el orden de milisegundos en un smartphone moderno y en decenas de milisegundos en dispositivos de gama baja.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| futo-keyboard-ptbr (este) | ~50M (según safetensors) | 256 | Apache-2.0 | Teclado predictivo, autocorrección, swipe para pt-BR |
| Modelos de swipe de FUTO (por ejemplo, los descritos en el artículo de AI Beat) | 2,5M totales (stack de 3 componentes) | no disponible | licencia libre (no especificada en detalle) | Swipe typing, autocorrección, predicción |
| Gboard (propietario) | no disponible | no disponible | propietaria | Teclado predictivo, swipe, autocorrección (multilingüe) |

No se dispone de datos de rendimiento comparativos entre estos modelos. La comparación se limita a características arquitectónicas y de disponibilidad. Gboard es claramente superior en cobertura de idiomas y funciones, pero es propietario y requiere conexión a internet para ciertas funciones; los modelos de FUTO son abiertos y funcionan offline.

## Limitaciones y advertencias

- **Ventana de contexto muy corta**: con solo 256 tokens, el modelo no puede aprovechar historial conversacional largo ni documentos extensos; está pensado únicamente para la predicción a nivel de frase.
- **Idioma limitado**: solo portugués brasileño. No soporta otros idiomas ni variantes del portugués (como el europeo).
- **Riesgo de alucinación**: al ser un modelo de lenguaje generativo, puede producir sugerencias gramaticalmente plausibles pero semánticamente incorrectas en contextos ambiguos, aunque su uso restringido a palabras sueltas reduce este riesgo.
- **Sesgos en los datos de entrenamiento**: los corpus utilizados (MADRAS1, Wikipedia, Pt-Corpus-Instruct) pueden contener sesgos de género, registro o temática que se reflejen en las predicciones.
- **Licencia de los datos subyacentes**: aunque los pesos se publican bajo Apache-2.0, cada corpus empleado tiene su propia licencia; es necesario revisarlas antes de redistribuir datos de entrenamiento o modelos derivados.
- **No es un modelo de propósito general**: no debe usarse para generación de texto libre, razonamiento, código u otras tareas; su diseño está optimizado exclusivamente para el entorno de teclado.
- **Dependencia del runtime de FUTO**: las características especiales (como `char_embed_mixing_v1`) requieren el runtime específico de FUTO Keyboard; no se garantiza que funcione correctamente en otros entornos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barddoo/futo-keyboard-ptbr
- Repositorio fuente: https://github.com/barddoo/futo-keyboard-ptbr
- Web de FUTO Keyboard: https://keyboard.futo.tech/
- Documentación técnica del sistema de modelo de lenguaje en FUTO Keyboard (DeepWiki): https://deepwiki.com/futo-org/android-keyboard/6.4-language-model-and-transformer
- Artículo sobre los modelos de swipe de FUTO (AI Beat): https://ai-beat.github.io/news/2026/06/futo-swipe-tiny-model/
- Web de FUTO Swipe: https://swipe.futo.tech/
