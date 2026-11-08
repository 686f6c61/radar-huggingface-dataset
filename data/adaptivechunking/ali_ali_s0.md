# AdaptiveChunking/ali_ali_s0

## Resumen

`ali_ali_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una ejecución concreta (seed 0) de un experimento de tokenización dinámica a nivel de byte sobre la arquitectura H-Net, construida con el framework `beetle-hnet`. El objetivo del experimento es estudiar cómo un modelo puede aprender a segmentar dinámicamente secuencias de bytes en lugar de depender de un tokenizador estático preentrenado.

El modelo tiene 22.785.088 parámetros totales (unos 22,8 millones) y se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. La elección de estos idiomas es relevante porque combina una lengua germánica con dos lenguas de morfología aglutinante y alta productividad léxica, lo que tensa los esquemas de tokenización habituales. El checkpoint se distribuye en ramas `step-N` siguiendo una programación logarítmica por fases, e incluye el estado completo del entrenador para permitir reanudación exacta.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para investigar segmentación adaptativa, tokenización byte-level y arquitecturas que aprenden a agrupar información antes de procesarla. No está pensado como modelo de producción ni como asistente, y su model card no documenta capacidades generativas, benchmarks ni uso comercial más allá de la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`), tokenización dinámica a nivel de byte, framework `beetle-hnet` |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante el entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante `ali`, con objetivo `ratio` y `schedule=None`, y decodificación de chunking con estrategia `dechunk=ema`. La característica central es que opera sobre bytes en lugar de tokens discretos y aprende a agrupar dinámicamente esos bytes en unidades de mayor nivel, lo que elimina la dependencia de un vocabulario fijo y permite adaptar la segmentación al contenido. El entrenamiento se realizó con el framework `beetle-hnet` (repositorio público en GitHub), con seed 0, 6000 pasos, batch de 32 y secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés.

El repositorio se organiza en ramas `step-N` correspondientes a checkpoints conservados según una programación logarítmica en base 2, con puntos en 0, 1, 2, 4, 6, 8, 16 y sucesivas potencias de dos desde el inicio de cada fase del objetivo, más el paso final. Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo del entrenador en `training_state/checkpoint.pt`. La rama `main` recoge los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y, una vez finalizada la ejecución, las pruebas de frontera FLORES+ en `probe/`. Los pesos atados se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres omitidos a los almacenados.

## Capacidades

- Modelo de investigación sobre tokenización dinámica byte-level; no se documentan capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada a los idiomas de entrenamiento: inglés, turco y finés.
- Capacidad intrínseca de segmentación adaptativa: el modelo aprende a agrupar bytes en chunks de forma dinámica, que es el objeto de estudio del experimento.
- Artefacto reproducible: incluye estado completo del entrenador para reanudación y checkpoints intermedios por fase.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización adaptativa: usar los checkpoints intermedios (`step-N`) para analizar cómo evoluciona la segmentación aprendida a lo largo del entrenamiento y comparar fases del objetivo `ratio`.
- Estudio de lenguas aglutinantes: emplear el modelo como banco de pruebas para medir cómo una segmentación byte-level dinámica maneja morfología productiva en turco y finés frente a tokenizadores BPE estándar.
- Reproducción de experimentos: reanudar el entrenamiento desde `training_state/checkpoint.pt` en cualquier rama para verificar resultados con la misma seed 0 y configuración.
- Evaluación de fronteras de chunking: utilizar las pruebas FLORES+ en `probe/` para comparar los límites de segmentación aprendidos con fronteras lingüísticas de referencia en los tres idiomas.
- Base para ablaciones: partir de esta ejecución como línea base y modificar `schedule`, `dechunk` u objetivo para medir el impacto en la segmentación y en la pérdida.
- Docencia y divulgación: ilustrar con un modelo pequeño (22,8 M de parámetros) y reproducible el funcionamiento de arquitecturas H-Net y de esquemas de chunking dinámico en cursos de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 millones de parámetros, los pesos en precisión completa ocupan del orden de 90 MB; en fp16, unos 45 MB. No se dispone de estimaciones oficiales de VRAM para activaciones ni estado del tokenizador dinámico.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente para cargar los pesos; no se documentan requisitos específicos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 en adelante), aunque no hay validación publicada.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada de `beetle-hnet`, requiere el código del repositorio del framework; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaptiveChunking/ali_ali_s0 | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE byte-level convencionales (p. ej. GPT-2 small) | ~124 M | 1024 tokens | Transformer con tokenizador BPE fijo | según modelo | amplia |
| Tokenizadores byte-level sin modelo asociado (p. ej. SentencePiece byte fallback) | n/a | n/a | Segmentación estática | según implementación | amplia |

No se dispone de comparativas publicadas con modelos de la misma categoría (H-Net u otros esquemas de chunking dinámico) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación de capacidades generativas; no debe usarse como asistente ni como modelo de producción.
- Entrenado solo con 6000 pasos y 32 secuencias de 1024 bytes por paso, lo que supone un volumen de cómputo muy reducido; los resultados no son extrapolables a escala mayor.
- Cobertura lingüística restringida a inglés, turco y finés; el comportamiento en otros idiomas no está documentado.
- No se han publicado análisis de sesgos, alucinación ni robustez.
- La arquitectura depende del framework `beetle-hnet`; la carga y el uso requieren código externo y pueden no ser compatibles con herramientas estándar de inferencia.
- El repositorio ocupa 3,5 GB debido al estado completo del entrenador, lo que encarece su descarga y almacenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación funcional hace desaconsejable cualquier despliegue productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali_s0
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
