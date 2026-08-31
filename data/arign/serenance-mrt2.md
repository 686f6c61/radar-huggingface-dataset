# arign/serenance-mrt2

## Resumen

Serenance MRT2 es una conversión y cuantización del modelo Magenta RealTime 2 (MRT2) de Google DeepMind, realizada por Arign Ltd para su aplicación de música de enfoque Serenance, que se ejecuta íntegramente en el Mac del usuario. MRT2 es un modelo de generación de música en tiempo real con pesos abiertos, diseñado para funcionar como un instrumento musical: permite controlar la generación mediante MIDI, audio y texto, con una latencia extremo a extremo de aproximadamente 200 ms. Esta versión específica está optimizada para inferencia local en Apple Silicon mediante el framework MLX, empaquetando los componentes MusicCoCa, SpectroStream y Depthformer en formato `.mlxfn`. Su relevancia radica en que democratiza la música generativa de baja latencia en hardware de consumo, sin necesidad de conexión a la nube, y ofrece dos tamaños de modelo (base y small) para adaptarse a distintas capacidades de los chips de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthformer (transformer) + MusicCoCa (encoders de texto/audio) + SpectroStream (codec de audio) |
| Parametros totales | no disponible (mrt2_small: 230M; mrt2_base: no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion MLX (no se especifican los bits exactos) |
| Idiomas soportados | no disponible (el modelo procesa texto para control de estilo, pero no se documentan idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.mlxfn` (MLX) |

## Arquitectura y entrenamiento

MRT2 se compone de tres módulos principales: MusicCoCa, un modelo de embedding de estilo texto/audio; SpectroStream, un codec que codifica y decodifica audio en tokens; y Depthformer, un transformer que genera los tokens de SpectroStream a partir de las condiciones de entrada (MIDI, audio o texto). Esta arquitectura permite una generación de audio en streaming con latencia muy baja, ya que el modelo opera sobre tokens de audio comprimidos en lugar de muestras crudas. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La conversión realizada por Arign Ltd no modifica el comportamiento del modelo, solo transforma los pesos al formato MLX y los cuantiza para eficiencia en Apple Silicon.

## Capacidades

- Generación de música en tiempo real con latencia de aproximadamente 200 ms extremo a extremo.
- Control multimodal: acepta entradas MIDI, audio de referencia y texto para dirigir el estilo y la estructura musical.
- Clonación de sonidos: puede imitar timbres y estilos a partir de ejemplos de audio.
- Mezcla de géneros: combina características de diferentes fuentes de audio o texto.
- Acompañamiento en vivo: genera música que sigue la interpretación del usuario en tiempo real.
- Ejecución local en Apple Silicon sin conexión a la nube, gracias al motor C++ `magentart::core` y al backend MLX.

## Casos de uso

- Aplicaciones de música de enfoque y productividad: Serenance utiliza este modelo para generar música ambiental que se adapta al estado del usuario, ejecutándose completamente en el Mac y garantizando privacidad y cero latencia de red.
- Instrumentos musicales virtuales: músicos pueden tocar MRT2 como un instrumento, usando MIDI para controlar la generación en tiempo real durante actuaciones o sesiones de estudio.
- Acompañamiento automático para práctica: un guitarrista o pianista puede tocar una melodía y el modelo genera un acompañamiento armónico coherente al instante, útil para ensayar o componer.
- Diseño de sonido para videojuegos: los desarrolladores pueden integrar MRT2 para generar música procedural que reaccione a las acciones del jugador, con baja latencia y sin depender de servidores externos.
- Prototipado rápido de ideas musicales: compositores pueden usar texto o audio de referencia para explorar variaciones de estilo y género sin necesidad de editar MIDI manualmente.
- Herramientas educativas de música: el modelo puede servir para demostrar conceptos de armonía, ritmo y composición en tiempo real, permitiendo a estudiantes experimentar con diferentes estilos de forma interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial de MRT2 menciona una latencia de control de aproximadamente 200 ms, pero no se proporcionan métricas comparativas estandarizadas (como MMLU, HumanEval, etc.) para este modelo de generación de música.

## Requisitos de hardware

- Apple Silicon obligatorio: el modelo está optimizado para chips M1, M2, M3 y posteriores.
- Modelo `mrt2_small` (230M parámetros): se ejecuta en tiempo real en cualquier Mac con Apple Silicon, incluidos los modelos Air.
- Modelo `mrt2_base`: requiere Apple Silicon Pro, Max o Ultra para funcionar en tiempo real.
- No se especifica la VRAM necesaria, pero al ser un modelo de 230M en cuantización MLX, se estima que cabe en la memoria unificada de cualquier Mac con al menos 8 GB.
- Opciones de despliegue: librería Python `magenta-rt` con backends JAX y MLX, motor C++ `magentart::core`, y formato `.mlxfn` para integración directa en aplicaciones nativas.
- No se dispone de datos de throughput o latencia específicos para esta conversión, más allá de la latencia de control de 200 ms reportada por Google.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de generación de música en tiempo real. MRT2 es un modelo relativamente único en su categoría por su baja latencia y su capacidad de ejecución local en Apple Silicon. Alternativas como MusicLM o Jukebox no ofrecen generación en tiempo real ni control MIDI, por lo que no son directamente comparables. Se recomienda consultar la documentación oficial de Magenta para más contexto.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos musicales, puede reflejar sesgos presentes en el corpus de entrenamiento (por ejemplo, predominancia de estilos occidentales).
- Riesgo de alucinación: en el contexto musical, el modelo puede generar salidas que no se corresponden con la entrada de control, especialmente con texto ambiguo o MIDI complejo.
- Limitaciones de idioma: el control por texto puede no funcionar igual de bien en todos los idiomas, aunque no se especifica cuáles están soportados.
- Restricciones de licencia: CC BY 4.0 permite uso comercial y adaptación, pero exige atribución adecuada a Google DeepMind y a Arign Ltd por las modificaciones.
- Advertencia de producción: la conversión MLX no ha sido validada por Google; cualquier problema de rendimiento o estabilidad debe reportarse a Arign Ltd, no a Google.
- El modelo está diseñado exclusivamente para Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin una conversión adicional a otro formato.

## Enlaces

- [HuggingFace - arign/serenance-mrt2](https://huggingface.co/arign/serenance-mrt2)
- [Magenta RealTime 2 - sitio oficial](https://magenta.withgoogle.com/mrt2)
- [Magenta RealTime 2 - página del modelo](https://magenta.withgoogle.com/magenta-realtime-2)
- [Paquete PyPI magenta-rt](https://pypi.org/project/magenta-rt/)
- [Artículo sobre MRT2 en mer.vin](https://mer.vin/2026/06/magenta-realtime-2-open-local-live-music-model-with-midi-and-200ms-latency/)
- [Documentación de modelos de Magenta RealTime](https://magenta.github.io/magenta-realtime/models.html)
