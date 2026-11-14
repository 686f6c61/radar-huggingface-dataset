# JoshHughes/gemma-4-26b-a4b-it-iq4xs-lma

## Resumen

Gemma 4 26B-A4B-it es un modelo de lenguaje de Google con arquitectura de mezcla de expertos (MoE) de 25.233.142.046 parámetros totales, del que este repositorio distribuye una cuantización GGUF concreta. Se trata de un modelo ajustado para instrucciones (sufijo `-it`) y orientado a generación de texto conversacional. La relevancia de esta ficha no reside en el modelo original, sino en el artefacto que empaqueta: una copia byte a byte de la cuantización UD-IQ4_XS de Unsloth, fijada a una revisión concreta para que el proyecto Local Model Access (LMA) pueda verificar su integridad mediante SHA-256.

El repositorio, publicado por JoshHughes, contiene un único fichero de 13.597.175.584 bytes (unos 13,6 GB) con hash SHA-256 `534e1bdfffdb62dff1d3636fedb41607a234b3b31abb7089947bac2aef00a960`. No incluye el proyector de visión, por lo que la variante multimodal del modelo base no está disponible en este artefacto. La licencia declarada es Apache 2.0, heredada del modelo base de Google y de la cuantización de Unsloth.

El interés técnico del artefacto es la reproducibilidad numérica: según la model card, la forma de «números enteros» que LMA implementa sobre estos bytes produce la misma salida en distintos backends (adaptador software de Chrome, GPUs NVIDIA Blackwell, Turing y Pascal en Windows y Linux, e Intel Battlemage y Arrow Lake en Linux), con una coincidencia del 99,69 % en el siguiente token frente al cálculo en coma flotante de 64 bits. Los metadatos de Hugging Face no aportan información sobre idiomas soportados ni sobre benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 30 capas, 128 expertos por capa, 8 expertos activos por token |
| Parámetros totales | 25.233.142.046 |
| Parámetros activos | no disponible (la model card indica 8 de 128 expertos por token, sin cifra de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-IQ4_XS (mezcla de IQ3_S, IQ4_NL, IQ4_XS y Q8_0); normas, routers y escalas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `gemma-4-26B-A4B-it-UD-IQ4_XS.gguf`, 13.597.175.584 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: 30 capas, cada una con 128 expertos, de los que cada token activa 8. Esta configuración reduce el coste de cómputo por token respecto a un modelo denso del mismo tamaño total, ya que solo una fracción de los parámetros participa en cada paso. El artefacto distribuido aquí es una cuantización de 4 bits aproximadamente (UD-IQ4_XS) que combina varios tipos de bloque (IQ3_S, IQ4_NL, IQ4_XS y Q8_0) y mantiene normas, routers y escalas en F32 para preservar la precisión en los componentes sensibles.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF, DPO u otros) del modelo base, más allá de que se trata de una variante ajustada para instrucciones. La innovación destacable del repositorio no es arquitectónica sino de determinismo: el proyecto LMA define una forma de ejecución en aritmética entera que, según la model card, reproduce los mismos tokens y los mismos valores por capa en todos los dispositivos que superan sus comprobaciones, lo que permite verificar trabajos de texto realizados en equipos de visitantes token a token.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, al ser una variante `-it` del modelo base.
- Razonamiento y matemáticas: capacidad esperable del modelo base, aunque no se documentan resultados concretos en la información disponible.
- Generación de código: no documentada en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los metadatos no declaran idiomas.
- Visión: no incluida en este artefacto, ya que el proyector de visión no forma parte del repositorio.
- Ejecución determinista verificable mediante la forma de números enteros de LMA, con coincidencia del 99,69 % en el siguiente token respecto al cálculo en 64 bits.

## Casos de uso

- Inferencia local verificable en el navegador: el fichero está pensado para que sitios web ejecuten el modelo sobre el equipo del visitante mediante LMA, con verificación por SHA-256 y tamaño del fichero aprobado en el registro del proyecto.
- Auditoría de resultados de inferencia: gracias a la reproducibilidad byte a byte entre backends, un servicio puede comprobar que el texto generado en el dispositivo del usuario corresponde exactamente al que produciría el modelo de referencia.
- Despliegue en estaciones de trabajo con GPU de consumo: con unos 14,2 GB de memoria gráfica necesarios, el modelo puede ejecutarse en equipos con GPUs NVIDIA Turing, Pascal o Blackwell, e Intel Battlemage o Arrow Lake, siempre que superen la puerta de admisión de LMA.
- Procesamiento de texto sin envío de datos a la nube: al residir el fichero en el dispositivo del usuario, es adecuado para flujos conversacionales en los que el contenido no debe salir del equipo.
- Integración en herramientas GGUF estándar: al ser un GGUF convencional, puede cargarse con llama.cpp, Ollama y otros runners compatibles para tareas de generación de texto en local.
- Pruebas de compatibilidad y regresión de cuantizaciones: útil para equipos que necesitan fijar una revisión concreta de los pesos y comparar salidas entre versiones de Unsloth, dado que el autor documenta diferencias de orden de entradas en la cabecera entre revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una métrica de fidelidad numérica: en respuestas de chat en el formato propio del modelo, la forma entera de LMA selecciona el mismo siguiente token que el cálculo en coma flotante de 64 bits el 99,69 % de las veces.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,2 GB de memoria gráfica, según la model card.
- GPUs validadas por LMA: NVIDIA Blackwell, Turing y Pascal en Windows y Linux; Intel Battlemage (discreta) y Arrow Lake (integrada) en Linux.
- GPU de consumo: el requisito de 14,2 GB encaja en tarjetas con 16 GB o más de VRAM; no se especifican modelos concretos en la información disponible.
- Restricciones de despliegue: LMA no asigna trabajos a teléfonos ni tabletas, solo a equipos que superan su puerta de admisión.
- Opciones de despliegue: llama.cpp, Ollama y otras herramientas compatibles con GGUF; el adaptador software de Chrome también ha sido validado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JoshHughes/gemma-4-26b-a4b-it-iq4xs-lma | 25.233.142.046 | no disponible | GGUF UD-IQ4_XS | Apache 2.0 | Copia fijada a una revisión para LMA; sin proyector de visión |
| google/gemma-4-26B-A4B-it | no disponible en la información | no disponible | no disponible | Apache 2.0 | Modelo base original de Google, variante para instrucciones |
| unsloth/gemma-4-26B-A4B-it-GGUF | no disponible en la información | no disponible | GGUF (incluye UD-IQ4_XS) | Apache 2.0 | Cuantizaciones de referencia; sus revisiones no coinciden en SHA-256 con este repositorio |

## Limitaciones y advertencias

- El repositorio no incluye el proyector de visión, por lo que no puede usarse para tareas multimodales aunque el modelo base las soporte.
- Los metadatos no declaran idiomas soportados, lo que impide garantizar cobertura lingüística sin evaluarla previamente.
- No se han publicado benchmarks del modelo base ni de esta cuantización en la información disponible; el rendimiento en tareas concretas debe medirse.
- La cuantización de 4 bits introduce pérdida de precisión respecto a los pesos originales; la model card solo cuantifica la fidelidad del siguiente token (99,69 %) en el formato de chat del modelo.
- El artefacto está pensado para el ecosistema LMA y su verificación por SHA-256; si se modifica el fichero o se usa otra revisión, las garantías de reproducibilidad descritas dejan de aplicarse.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse antes de un uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de Google por si añaden términos adicionales no reflejados en esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JoshHughes/gemma-4-26b-a4b-it-iq4xs-lma
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantización de Unsloth: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Revisión de Unsloth citada en la model card: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF/blob/b19ae878a3d8d38352d69c370321f94ff98023a0/gemma-4-26B-A4B-it-UD-IQ4_XS.gguf
- Proyecto Local Model Access: https://github.com/ArtistJoshHughes/local-model-access
- Especificación de LMA: https://github.com/ArtistJoshHughes/local-model-access/blob/main/SPEC.md
- Registro de modelos de LMA: https://github.com/ArtistJoshHughes/local-model-access/blob/main/registry/models.json
