# 0xra/Rogue-RVC

## Resumen

Rogue-RVC es un modelo de conversión de voz (voice conversion) de tipo RVC v2, publicado por el usuario 0xra en Hugging Face y entrenado con la aplicación Applio. No es un modelo de texto a voz ni un modelo de lenguaje: recibe una interpretación de voz o canto ya existente y transforma su timbre para acercarlo al de la voz objetivo («rogue», extraída de audio del videojuego Cyberpunk 2077), conservando buena parte del ritmo, la frase y el contorno de pitch del audio de origen. El paquete se compone de un checkpoint PyTorch (`rogue.pth`, 57.532.660 bytes) y un índice de recuperación (`rogue.index`, 333.505.619 bytes), que refuerza el timbre objetivo durante la inferencia.

Técnicamente se apoya en la arquitectura estándar de RVC v2: embedder ContentVec para extraer representaciones de contenido, extractor de pitch RMVPE, vocoder HiFi-GAN y una frecuencia de muestreo de 48.000 Hz. El modelo es de un único hablante y su checkpoint publicado corresponde a la época 200 (paso 26.200) de un entrenamiento configurado para 300 épocas. El dataset embebido consta de 626 archivos WAV mono a 16 bits y 48 kHz, con 35 minutos y 0,422 segundos de audio total.

Su relevancia es acotada y muy específica: se trata de un artefacto de la comunidad de conversión de voz, orientado a doblaje de fan, modding de videojuegos y experimentación con pipelines RVC/Applio. El repositorio no declara licencia, no incluye idiomas soportados, no aporta benchmarks y no registra descargas ni valoraciones en el momento de la consulta, por lo que debe tratarse como un experimento reproducible más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Retrieval-Based Voice Conversion (RVC) v2; embedder ContentVec, extractor de F0 RMVPE, vocoder HiFi-GAN |
| Parámetros totales | no disponible (el checkpoint `rogue.pth` ocupa 57.532.660 bytes, 54,87 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de conversión por fragmentos (preprocesado en trozos de 3,0 s con 0,3 s de solapamiento) |
| Tipos de cuantización | no disponible (se distribuye un único checkpoint en la precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (`rogue.pth`) más índice de recuperación `.index` (`rogue.index`), empaquetados en `rogue.zip` |
| Frecuencia de muestreo | 48.000 Hz |
| Número de hablantes | 1 |
| Voz objetivo | `rogue` (nombre interno del modelo durante el entrenamiento: `mara`) |
| Checkpoint publicado | época 200, paso 26.200 |
| Guiado por F0 / pitch | activado |
| Tamaño del repositorio | 0,1 GB según Hugging Face |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-09-26 (ambas) |

## Arquitectura y entrenamiento

El modelo sigue el esquema canónico de RVC v2 implementado en Applio: un embedder ContentVec extrae representaciones de contenido del audio de entrada, RMVPE estima el contorno de F0, y el decodificador con vocoder HiFi-GAN reconstruye la señal a 48 kHz con el timbre objetivo. Adicionalmente se usa un índice de recuperación (`rogue.index`, 318,06 MiB) que busca vecinos cercanos en el espacio de características para reforzar el timbre del hablante objetivo durante la inferencia, un mecanismo característico de la variante «retrieval-based» de RVC. Al ser un modelo de conversión de voz y no un modelo autorregresivo, no tiene ventana de contexto en el sentido de los LLM: el audio se procesa por fragmentos.

El entrenamiento se realizó con un dataset de 626 archivos WAV extraídos del juego, todos mono, a 16 bits y 48 kHz, con una duración total de 35:00.422. Las duraciones por clip son de 1,210 s (mínimo), 2,900 s (mediana), 3,355 s (media) y 11,732 s (máximo). En el preprocesado se usó corte automático con fragmentos de 3,0 s y 0,3 s de solapamiento, con «Process Effects» y «Noise Reduction» desactivados deliberadamente, ya que el audio de origen ya estaba masterizado y una limpieza adicional podría eliminar respiraciones, sibilantes y otros detalles útiles para la conversión. La extracción de características empleó RMVPE y ContentVec. El entrenamiento se configuró con batch size 8, 300 épocas totales, guardado cada 10 épocas, pesos preentrenados activados y caché de dataset en GPU desactivada; sin embargo, el checkpoint distribuido se identifica como época 200 (paso 26.200), motivo por el cual la model card lo describe explícitamente como el checkpoint de la época 200 y no como un modelo de 300 épocas. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación, algo por otra parte ajeno a este tipo de modelos.

## Capacidades

- Conversión de voz (audio a audio): transforma una interpretación de habla o canto hacia el timbre de la voz objetivo, preservando el contenido lingüístico y buena parte de la prosodia de origen.
- Mantenimiento del contorno de pitch: el guiado por F0 está activado, lo que permite conservar melodías en el canto y entonación en el habla.
- Reforzamiento de timbre mediante recuperación: el índice `rogue.index` permite ajustar cuánto se fuerza la similitud con el hablante objetivo mediante el parámetro `index_rate`.
- Control de protección de consonantes y envolvente de volumen: parámetros `protect` y `volume_envelope` disponibles en la inferencia para reducir artefactos.
- Funcionamiento mono-hablante: una única voz objetivo, sin selección de hablante en tiempo de ejecución.
- Procesado por fragmentos: admite entradas de duración arbitraria al dividirlas en trozos (3,0 s en el preprocesado, con solapamiento configurable).
- No dispone de: generación de texto a voz, tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada distinto de voz/canto, ni traducción.

## Casos de uso

- Doblaje de fan y parodia: convertir las voces de actores o aficionados al timbre de la voz objetivo para producir versiones alternativas de escenas o mods narrativos, aprovechando que el modelo conserva el fraseo original y solo sustituye el timbre.
- Modding de videojuegos: sustituir o ampliar las líneas de voz de un personaje en un mod, reutilizando grabaciones propias y convirtiéndolas con el checkpoint y el índice de recuperación.
- Conversión de canto (cover): aplicar la voz objetivo a una pista vocal manteniendo la melodía gracias al guiado por F0 con RMVPE, ajustando `pitch` para transponer si es necesario.
- Prototipado rápido de personajes: generar muestras de voz provisionales para animáticas, machinima o vídeos cortos antes de contratar una locución definitiva.
- Investigación en conversión de voz: servir como caso de estudio reproducible de un pipeline Applio completo (ContentVec + RMVPE + HiFi-GAN + índice de recuperación) para comparar configuraciones de `index_rate` y `protect`.
- Evaluación de robustez de RVC v2: analizar cómo se comporta el modelo con audio de origen degradado, dado que el entrenamiento se hizo sin reducción de ruido y sin efectos de procesado.
- Docencia y talleres: demostrar en un aula el flujo completo de preprocesado, extracción y entrenamiento de un modelo RVC con un dataset pequeño (35 minutos) y recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, similitud de hablante, error de F0, inteligibilidad) ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible. Las siguientes indicaciones son estimaciones derivadas del tamaño de los artefactos y deben validarse en el entorno de despliegue concreto.
- VRAM estimada para inferencia: el checkpoint de pesos ocupa 54,87 MiB, por lo que la huella del modelo es muy inferior a la de un LLM; cabe en GPUs de gama de entrada con 4 GB o menos de VRAM. La carga dominante es el índice de recuperación (`rogue.index`, 318,06 MiB), que en las implementaciones habituales se mantiene en memoria del sistema.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, así como A100 o H100 si se integra en un servicio multiusuario. También es viable la inferencia en CPU, con mayor latencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales.
- Opciones de despliegue: Applio (aplicación principal indicada por el autor), con inferencia vía `core.py`; el flujo estándar de RVC se apoya en PyTorch con CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Comando de inferencia de ejemplo proporcionado por el autor: `python core.py infer --input_path input.wav --output_path rogue_output.wav --pth_path logs/Rogue/rogue.pth --index_path logs/Rogue/rogue.index --pitch 0 --index_rate 0.75 --volume_envelope 1 --protect 0.5 --f0_method rmvpe --embedder_model contentvec`. Los valores indicados son puntos de partida, no parámetros de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables sobre alternativas comparables en la información proporcionada, ni de benchmarks que permitan una comparación cuantitativa. Cualitativamente, este modelo pertenece a la categoría de checkpoints RVC v2 de la comunidad, cuya comparación honesta exigiría evaluar similitud de hablante y MOS sobre el mismo conjunto de prueba, algo que la model card no aporta.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0xra/Rogue-RVC | RVC v2 (ContentVec + RMVPE + HiFi-GAN) | no disponible (checkpoint de 54,87 MiB) | no aplica (por fragmentos) | no disponible | repositorio Hugging Face, 0 descargas |
| Otros checkpoints RVC v2 de la comunidad | RVC v2 | no disponible | no aplica | no disponible | no disponible |
| so-vits-svc | conversión de voz basada en VITS | no disponible | no aplica | no disponible | no disponible |
| DiffSVC | conversión de voz basada en difusión | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de texto a voz: no genera habla a partir de texto, requiere una grabación de voz o canto como entrada.
- No declara licencia: la ausencia de licencia explícita impide asumir permisos de uso comercial; cualquier uso en producción debería aclararse previamente con el autor.
- Riesgo legal sobre el material de origen: la voz objetivo procede de audio de Cyberpunk 2077, propiedad de sus titulares; el uso del timbre de un personaje puede infringir derechos de propiedad intelectual o de imagen según la jurisdicción.
- Riesgo de suplantación de identidad: como todo modelo de conversión de voz, puede emplearse para crear audio engañoso. Es responsabilidad del usuario aplicar medidas de consentimiento y etiquetado.
- Sesgos y cobertura: el modelo se entrenó con 35 minutos de audio de un único hablante y una única fuente, por lo que su comportamiento fuera de ese dominio (otros idiomas, registros vocales, ruido de fondo, micrófono de campo) no está caracterizado.
- Idiomas: no declarados. El dataset proviene de audio del juego, por lo que la generalización a otros idiomas es incierta y no verificada.
- Artefactos esperables en RVC: inestabilidad en segmentos largos o con F0 errático, sibilancia alterada, respiraciones reconstruidas de forma imperfecta y posibles transiciones audibles entre fragmentos. Los parámetros `protect` e `index_rate` mitigan parcialmente estos efectos.
- Discrepancia de tamaño del repositorio: el tamaño declarado (0,1 GB) es inferior a la suma de `rogue.pth` y `rogue.index` (aproximadamente 373 MiB). La model card condiciona el uso del descargador de Applio a que `rogue.zip` se haya subido al repositorio, por lo que conviene verificar qué archivos están realmente disponibles antes de integrar el modelo.
- Nomenclatura confusa: los archivos distribuidos se llaman `rogue.*` mientras que los metadatos internos de `rogue.pth` siguen reportando `model_name: mara`. Hay que tenerlo en cuenta al automatizar la carga o al auditar el modelo.
- Actividad nula en el repositorio: cero descargas y cero valoraciones en la fecha de consulta, sin evidencia pública de validación independiente.
- Ruta de doblaje incompleta: el modelo no está entrenado para diálogo con reducción de ruido ni para audio de micrófono doméstico; el autor desactivó explícitamente la limpieza de ruido y los efectos de procesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xra/Rogue-RVC
- Documentación oficial de Applio para instalar modelos de inferencia: https://docs.applio.org/getting-started/installing-inference-models/
- Búsqueda web realizada: no devolvió resultados relevantes sobre el modelo, su paper o su repositorio. Los enlaces recuperados versaban sobre rutas de viaje entre París y Niza y no guardan relación con este modelo, por lo que se omiten.
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
- Demos o espacios asociados: no disponibles.
