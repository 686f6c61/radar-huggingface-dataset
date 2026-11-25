# KRAFTON/Raon-1-mini-preview-dflash2

## Resumen

Raon-1-mini-preview-dflash2 es el modelo borrador (draft) de decodificación especulativa del modelo Raon-1 mini preview, desarrollado por KRAFTON AI. No se trata de un modelo autónomo: es un componente auxiliar que se combina con Raon-1 mini preview para acelerar la generación mediante decodificación especulativa en vLLM. El repositorio pesa 5,4 GB y contiene 677.776.640 parámetros en formato safetensors.

El modelo base, Raon-1 mini preview, es un MoE híbrido de 28,8B parámetros totales y 4,3B activos por token, entrenado desde cero por KRAFTON AI, con especial énfasis en conversación en coreano y tareas agénticas. Emplea una arquitectura de 25 capas que combina 18 capas de Raon Delta Attention (atención lineal con estado de tamaño fijo) y 7 capas de Gated MLA, con una longitud de contexto nativa de 262.144 tokens.

La relevancia de este repositorio es operativa: permite reducir la latencia de inferencia del modelo base en despliegues con vLLM. Su licencia Apache 2.0 y su integración con el ecosistema vLLM lo hacen adecuado para entornos de producción que ya sirvan Raon-1 mini preview y busquen mejorar el throughput sin cambiar de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de decodificación especulativa (draft) para Raon-1 mini preview; el modelo base es un MoE híbrido con RDA y Gated MLA |
| Parametros totales | 677.776.640 (modelo borrador); 28,8B en el modelo base |
| Parametros activos | No aplica al borrador; 4,3B en el modelo base (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens en el modelo base; no disponible de forma independiente para el borrador |
| Tipos de cuantizacion | El modelo base ofrece MXFP8 y NVFP4; el borrador se distribuye en safetensors (BF16 presumiblemente); no se detallan otras cuantizaciones para el borrador |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base destaca en coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el modelo borrador DFlash2 para decodificación especulativa, diseñado para emparejarse con Raon-1 mini preview. La decodificación especulativa consiste en que un modelo pequeño propone varios tokens candidatos que el modelo grande verifica en paralelo, reduciendo el número de pasos secuenciales y, por tanto, la latencia. El borrador debe compartir el tokenizador y el vocabulario del modelo base (259.840 tokens) para que la verificación sea válida.

El modelo base Raon-1 mini preview emplea una arquitectura MoE híbrida de 25 capas: 18 capas de Raon Delta Attention (RDA), una variante que desacopla las compuertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo, y 7 capas de Gated MLA que mantienen caché KV (aproximadamente 8 KiB por token en BF16). Incorpora Raon-mHC, una versión optimizada de las hyper-connections con restricción de variedad de DeepSeek, con 4 flujos residuales, y usa SiTU-GLU como función de activación. El tamaño oculto es 2.560, con 40 cabezas de atención de dimensión 128 (RDA) y 192 QK / 128 V (Gated MLA), y codificación posicional NoPE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa cuando se combina con Raon-1 mini preview en vLLM.
- Generación de texto heredada del modelo base: razonamiento con modo de pensamiento integrado, matemáticas y ciencia.
- Conversación en coreano e inglés con buen rendimiento según el autor.
- Ejecución de agentes y tool calling en el modelo base, con soporte para Hermes Agent, Pi y OpenCode.
- Seguimiento de instrucciones y tareas de búsqueda destacadas por el autor en el modelo base.
- Capacidad multilingüe limitada a lo indicado por el autor (coreano e inglés); no se detallan más idiomas.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Servicio de chat de baja latencia en coreano: desplegar Raon-1 mini preview con el borrador DFlash2 en vLLM reduce el tiempo hasta el primer token y el tiempo por token en conversaciones multi-turno, aprovechando el contexto de 262.144 tokens del modelo base para historiales largos.
- Asistentes agénticos con tool calling: el modelo base soporta ejecución de herramientas y flujos multi-paso; el borrador acelera las iteraciones del agente, donde se encadenan muchas llamadas cortas al modelo.
- Generación de código asistida en IDE: integrar el par modelo base + borrador en un backend vLLM para autocompletado y explicación de código con latencia interactiva.
- Procesamiento de documentos largos: resúmenes y extracción de información sobre contratos o informes de decenas de miles de tokens gracias a la ventana de 262.144 tokens y a la atención lineal RDA, que reduce el coste de memoria de la caché KV.
- Razonamiento matemático y científico por lotes: usar el modo de pensamiento del modelo base en pipelines de evaluación o generación de soluciones, con el borrador mejorando el throughput agregado.
- Despliegue en una sola GPU consumer: el modelo base en NVFP4 cabe en una NVIDIA RTX 5090 de 32 GB según el autor, y el borrador añade una sobrecarga de memoria moderada; útil para prototipos y demos locales.
- Investigación en decodificación especulativa: el repositorio sirve como referencia para estudiar la integración de borradores DFlash2 con modelos MoE híbridos en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo borrador en la información disponible. El autor presenta gráficas comparativas del modelo base Raon-1 mini preview frente a otros modelos abiertos, pero los valores numéricos no están incluidos en el texto proporcionado, por lo que no se reproducen.

## Requisitos de hardware

- El borrador añade 677,8 M de parámetros (5,4 GB de repositorio) sobre el modelo base; la VRAM total depende principalmente de Raon-1 mini preview.
- El modelo base en NVFP4 permite inferencia en una única NVIDIA RTX 5090 (32 GB de VRAM) según el autor.
- Para el modelo base en BF16 se requiere hardware de centro de datos; no se especifican cifras exactas de VRAM en la información disponible.
- GPU recomendadas: no detalladas por el autor más allá de la RTX 5090 para NVFP4; para BF16 se asume A100/H100 por el tamaño del modelo base, sin confirmación oficial.
- Despliegue: vLLM es la librería soportada oficialmente; el autor indica un quickstart de vLLM para usar el borrador junto al modelo base.
- Latencia y throughput: no se publican cifras concretas de mejora en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros borradores de decodificación especulativa ni con modelos de tamaño equivalente.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como borrador de decodificación especulativa junto a Raon-1 mini preview; usarlo de forma independiente no produce resultados válidos.
- Es una versión preview: el autor advierte que las especificaciones y resultados pueden cambiar antes de la versión final.
- El repositorio exige solicitud de acceso (gated) con datos de nombre, afiliación, país y uso previsto, aunque la licencia sea Apache 2.0.
- La información sobre idiomas soportados por el borrador no está disponible; las capacidades lingüísticas dependen del modelo base (coreano e inglés).
- Riesgo de alucinación y sesgos del modelo base no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero la puerta de acceso puede condicionar la distribución y el despliegue.
- El rendimiento de la decodificación especulativa depende de la tasa de aceptación del borrador; no se publican métricas al respecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa: https://www.krafton.com/en/
