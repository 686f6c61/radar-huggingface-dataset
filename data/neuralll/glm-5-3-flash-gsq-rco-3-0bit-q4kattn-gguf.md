# neuralll/GLM-5.3-Flash-GSQ-RCO-3.0bit-Q4Kattn-GGUF

## Resumen

GLM-5.3-Flash GSQ-RCO 3.0-bit con atención Q4_K es una cuantización GGUF del modelo MoE GLM-5.3-Flash, publicada por el usuario neuralll sobre el trabajo previo de pfeifferj. No es un modelo entrenado desde cero, sino una variante de un archivo GGUF ya cuantizado a 3,0 bits mediante las técnicas GSQ y RCO del IST-DASLab, en la que se han recuantizado a Q4_K únicamente los tensores no pertenecientes a los expertos enrutados (atención, expertos compartidos, FFN densa y cabeza de salida). El objetivo es acelerar la decodificación en un solo flujo de un modelo de 313.326.811.966 parámetros totales que ocupa 113,6 GB en disco.

El modelo subyacente es un transformer con mezcla de expertos (MoE) organizado en 42 capas MoE con 288 expertos enrutados por capa, de los cuales cada token activa 8. La relevancia práctica de esta ficha no está en el modelo base, sino en el ecosistema que lo acompaña: requiere un fork de llama.cpp (neurall/llama.cpp) que añade soporte para GLM-5.3-Flash y una caché de expertos calientes residente en VRAM, con la que el autor reporta 26-28 t/s frente a 12,3 t/s de llama.cpp estándar en 2x RTX 3090, a cambio de un deterioro de perplejidad del 0,95 % (3,5871 frente a 3,5534 en wikitext-2).

Se trata, por tanto, de una pieza orientada a inferencia local en hardware de consumo multi-GPU, con licencia MIT y formato GGUF, publicada el 24 de septiembre de 2026. No se han documentado datos de contexto máximo, idiomas soportados ni resultados de benchmarks de conocimiento o razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (transformer con mezcla de expertos); 42 capas MoE, 288 expertos enrutados por capa, 8 activos por token y capa |
| Parametros totales | 313.326.811.966 (~313,3 B) |
| Parametros activos | no disponible (la model card indica 8 de 288 expertos por capa, pero no publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible (las pruebas se hicieron con `-c 1024`) |
| Tipos de cuantizacion | GGUF 3,0 bits con asignación GSQ-RCO; tensores no experto y de atención en Q4_K; `token_embd` y todos los tensores F32/BF16 copiados sin cambios; 126 tensores de expertos enrutados sin modificar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Modelo base | pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF (relación: quantized) |
| Tamaño del repositorio | 113,6 GB |
| Cuantización previa | GSQ-RCO 3,0 bits (reproducción comunitaria de métodos del IST-DASLab) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos. La model card describe 42 capas MoE, cada una con 288 expertos enrutados, y un enrutamiento que activa 8 expertos por token y capa (del orden del 2,8 % de los expertos disponibles). Los tensores de expertos enrutados son 126 (tres por capa: presumiblemente proyecciones de puerta, subida y bajada de cada bloque de expertos). Además de los expertos enrutados, el modelo cuenta con pesos no experto: atención, expertos compartidos, FFN densa y cabeza de salida, más el `token_embd`.

Esta ficha no describe el entrenamiento del modelo original, ya que el artefacto publicado es exclusivamente una cuantización. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, ni sobre fases de ajuste como RLHF o DPO. El trabajo técnico que sí está documentado es la cuantización: el archivo original aplica las técnicas GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649) del IST-DASLab, asignando precisiones por tensor de forma deliberada; esta variante sobrescribe los tensores Q8_0 no experto a Q4_K (unos 8,3 GB del archivo) para reducir el coste de streaming por token, dejando intactos los expertos.

La segunda innovación relevante es externa al archivo: el fork neurall/llama.cpp implementa una caché LRU de expertos calientes residente en GPU, que llena la VRAM libre con aproximadamente los 100 expertos más usados de cada capa, en lugar de reservar capas completas de forma estática. Según el autor, esto eleva la proporción de trabajo de expertos ejecutado en GPU del 33 % al 85 %, con el 15 % restante en CPU de forma solapada, y habilita aceleración multi-GPU real (2x en 2x RTX 3090). El fork se apoya en el PR #27861 de llama.cpp (csantiago78) y el soporte de GLM-5.3-Flash llega vía los PR #27773 y #27917 (timkhronos).

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational`, y el ejemplo de uso documentado es la generación de un juego de Tetris en HTML.
- Mezcla de expertos con activación dispersa: 8 de 288 expertos por capa y token, lo que permite mantener la mayor parte de los pesos fuera de la memoria de la GPU.
- Decodificación optimizada para un solo flujo con caché de expertos: el diseño del fork prioriza la velocidad de decodificación en streaming individual, no el throughput por lotes.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Visión, audio u otras modalidades: no documentado.
- Modo de razonamiento explícito (*thinking mode*): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo: el modelo puede desplegarse con `llama-server` en una máquina con 2 GPU de 24 GB y 125 GB de RAM, gestionando conversaciones multi-turno sin enviar datos a servicios externos, algo relevante para equipos con requisitos de confidencialidad.
- Generación de código en local para tareas puntuales: la model card valida el modelo generando un juego de Tetris en HTML con temperatura 0; es un escenario realista para prototipado rápido de fragmentos de código sin conexión a APIs externas.
- Investigación en cuantización: sirve como caso de estudio reproducible del compromiso entre precisión de tensor y velocidad, ya que el autor documenta el comando exacto de `llama-quantize` y el archivo `tensor-types-q4kattn.txt` con la asignación de tipos.
- Evaluación de estrategias de offload CPU/GPU en MoE: permite comparar empíricamente el reparto estático por capas de llama.cpp estándar frente a la caché de expertos calientes, con métricas publicadas de perplejidad y tokens por segundo.
- Servicio de inferencia de baja concurrencia: con `-np 1` y una caché dimensionada para un único flujo, encaja en escenarios donde la latencia de un usuario importa más que el throughput agregado.
- Experimentación con arquitecturas MoE de gran tamaño en hardware de consumo: 113,6 GB de pesos repartidos entre 48 GB de VRAM y RAM del sistema permiten estudiar comportamiento de modelos de más de 300 000 millones de parámetros sin clúster.
- Base para *benchmarking* de cuantizaciones alternativas: al conservar la asignación RCO en todos los tensores salvo atención y pesos no experto, sirve como referencia para medir el coste de recuantizar otras partes del modelo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor, medidos en 2x RTX 3090 (48 GB de VRAM), 125 GB de RAM, CPU de 8 núcleos, un solo flujo, con el prompt "generate smallest html tetris game.", contexto de 1024 y temperatura 0. La perplejidad se midió sobre wikitext-2, con 40 fragmentos de 512 tokens.

| Modelo / configuración | Decode (t/s) | Perplejidad (wikitext-2) |
|---|---|---|
| Original 3,0 bits, llama.cpp estándar (autofit) | 12,3 | 3,5534 |
| Original 3,0 bits, fork con caché de expertos | ~25 | 3,5534 |
| Este archivo (atención Q4_K), fork con caché de expertos | 27,72 | 3,5871 (+0,95 %) |

Reparto de trabajo de expertos según el autor:

| Configuración | Trabajo de expertos en GPU | Trabajo de expertos en CPU | Decode (t/s) |
|---|---|---|---|
| llama.cpp estándar (capas completas estáticas) | ~33 % | ~67 % | 12,3 |
| Fork con caché de expertos calientes | ~85 % | ~15 %, en paralelo | 26-28 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de capacidades en la información disponible.

## Requisitos de hardware

- Almacenamiento: 113,6 GB para el archivo GGUF, más el espacio necesario para el binario y el archivo de plantilla de tipos de tensor si se va a reproducir la cuantización.
- Configuración probada por el autor: 2x RTX 3090 (48 GB de VRAM en total) + 125 GB de RAM + CPU de 8 núcleos. Con esta configuración se obtienen 27,72 t/s de decodificación en un solo flujo.
- La model card no incluye estimaciones de VRAM para otras combinaciones de GPU ni para otras cuantizaciones. No disponible.
- Cabe en GPU de consumo únicamente en configuraciones multi-GPU: una sola tarjeta de 24 GB no aloja el modelo, y una tarjeta de 48 GB tampoco cubre los 113,6 GB de pesos. El reparto entre VRAM y RAM del sistema es obligatorio.
- El fork monitoriza una ventana de 64 tokens para decidir qué expertos mantiene en caché; el rendimiento óptimo requiere llenar toda la VRAM libre, por lo que conviene fijar `-c` explícitamente para no perder memoria en el ajuste automático de contexto.
- Despliegue: llama.cpp, y en concreto el fork neurall/llama.cpp, porque llama.cpp estándar no carga GLM-5.3-Flash. Comando de referencia:
  ```sh
  llama-server -m GLM-5.3-Flash-GSQ-RCO-3.0bit-q4kattn.gguf \
      -np 1 -c 1024 -t 6 --cpu-moe -nr --moe-expert-cache -1
  ```
- El archivo también carga en cualquier build con soporte de GLM-5.3-Flash (PR #27773 / #27917), pero a la velocidad de llama.cpp estándar (12,3 t/s en la configuración medida), sin caché de expertos.
- Soporte en vLLM, Ollama, TGI u otros motores de inferencia: no disponible en la información proporcionada.
- Latencia: no se publican medidas de *time to first token* ni de latencia por petición. Solo se documenta el throughput de decodificación en un único flujo.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Perplejidad (wikitext-2, según autor) | Decode (2x RTX 3090) | Licencia |
|---|---|---|---|---|---|---|
| Este archivo (3,0 bits, atención Q4_K) | 313,3 B totales | GGUF | no disponible | 3,5871 | 27,72 t/s | MIT |
| pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF (3,0 bits) | 313,3 B totales | GGUF | no disponible | 3,5534 | 12,3 t/s (estándar) / ~25 t/s (fork) | MIT |
| zai-org/GLM-5.3-Flash (original) | 313,3 B totales | no disponible | no disponible | no disponible | no disponible | MIT |

La comparación se limita a variantes del mismo modelo base porque la información disponible no incluye referencias a modelos alternativos de tamaño o categoría equivalentes. La diferencia práctica entre las dos primeras filas es el compromiso explícito del autor: aproximadamente un 1 % más de perplejidad a cambio de en torno a un 10 % más de velocidad de decodificación, sacrificando la asignación de precisión que RCO había diseñado para los tensores de atención y los pesos no experto.

## Limitaciones y advertencias

- Requiere un fork de llama.cpp. El soporte de GLM-5.3-Flash y la caché de expertos no están en llama.cpp estándar en el momento de publicación; usarlo con un binario sin soporte simplemente falla al cargar.
- La recuantización de atención y pesos no experto a Q4_K altera la asignación RCO original. El propio autor señala que RCO eligió la precisión de cada tensor de forma deliberada y que, si se quiere la asignación tal como se diseñó, debe usarse el archivo original.
- Deterioro medido de perplejidad: 3,5871 frente a 3,5534 (+0,95 %) en wikitext-2, con una única semilla de evaluación y 40 fragmentos de 512 tokens.
- La ganancia de velocidad depende de la distribución de uso de expertos. El autor asume un uso sesgado por el que los ~100 expertos más usados de cada capa cubren alrededor del 85 % de las selecciones; en dominios con enrutamiento más disperso esa cobertura puede reducirse y el rendimiento acercarse al de llama.cpp estándar.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos. No se han publicado evaluaciones de veracidad, calibración ni tasas de alucinación para este modelo o su base.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo, toxicidad ni comportamientos diferenciales por subgrupo.
- Idiomas: no disponible. No se declara ninguna lista de idiomas soportados ni evaluaciones multilingües, pese a que el modelo original GLM suele distribuirse con soporte multiidioma.
- Contexto: no disponible. Las únicas pruebas usadas se hicieron con 1024 tokens; se desconoce la ventana máxima soportada y el comportamiento con contextos largos, así como el coste de memoria de la KV cache asociada.
- Restricciones de licencia: el artefacto se publica bajo MIT, la misma licencia que el modelo base zai-org/GLM-5.3-Flash, por lo que el uso comercial está permitido. Debe conservarse el archivo `LICENSE` y tenerse en cuenta que la cuantización es una reproducción comunitaria, no un lanzamiento del IST-DASLab ni del equipo de Z.ai.
- Producción: el modelo ocupa 113,6 GB y exige reparto entre VRAM y RAM, con lo que el rendimiento depende fuertemente de la configuración de memoria y del número de GPUs. Con `-np 1`, la caché está dimensionada para un único flujo; aumentar la concurrencia degradará el acierto de la caché y, con él, la velocidad.
- Estado del artefacto: 16 descargas y 1 *like* en el momento de redactar esta ficha, con documentación mantenida por un autor individual. La model card contiene erratas y afirmaciones de rendimiento no verificadas de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/neuralll/GLM-5.3-Flash-GSQ-RCO-3.0bit-Q4Kattn-GGUF
- Modelo base de la cuantización: https://huggingface.co/pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fork de llama.cpp con soporte de GLM-5.3-Flash y caché de expertos: https://github.com/neurall/llama.cpp
- PR de llama.cpp con la caché LRU de expertos en GPU (csantiago78): https://github.com/ggml-org/llama.cpp/pull/27861
- PR de llama.cpp con soporte de GLM-5.3-Flash: https://github.com/ggml-org/llama.cpp/pull/27773
- PR de llama.cpp con soporte de GLM-5.3-Flash: https://github.com/ggml-org/llama.cpp/pull/27917
- Artículo GSQ: https://arxiv.org/abs/2604.18556
- Artículo RCO: https://arxiv.org/abs/2605.00649
