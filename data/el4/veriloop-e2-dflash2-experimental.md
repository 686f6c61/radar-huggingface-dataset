# el4/VeriLoop-E2-Dflash2-experimental

## Resumen

VeriLoop-E2-Dflash2-experimental es un artefacto de investigación publicado por el usuario el4 en Hugging Face, consistente en un cabezal de decodificación especulativa (speculative decoding head) para el modelo base tsinghua-sigs-robot-lab/VeriLoop-E2, un modelo post-entrenado de 27B parámetros construido sobre Qwen3.8-27B y orientado a código verificable, matemáticas, razonamiento científico y resolución de problemas agénticos de largo horizonte. El artefacto no es un modelo completo autónomo, sino un componente auxiliar en formato GGUF pensado para integrarse en el ecosistema llama.cpp (concretamente en el fork ik_llama.cpp) y acelerar la generación mediante decodificación especulativa con múltiples tokens por paso (MTP).

La relevancia de esta publicación es doble. Por un lado, documenta un experimento de entrenamiento de un cabezal de borrador (draft head) realizado en una GPU de portátil (NVIDIA GeForce RTX 4080 Laptop, 11,67 GB de VRAM), lo que resulta poco habitual en este tipo de trabajos. Por otro lado, el autor publica métricas de auto-evaluación que cuantifican la brecha entre el rendimiento del cabezal y su techo teórico, ofreciendo una instantánea honesta de un sistema en fase exploratoria. El repositorio ocupa 1,5 GB y se distribuye bajo licencia Apache 2.0.

Es importante subrayar que se trata de un artefacto experimental: el propio autor advierte que no puede verificar las tasas de aceptación en su hardware por limitaciones de VRAM (cachés KV), y que las cifras publicadas corresponden a una evaluación parcial. No debe considerarse un modelo listo para producción ni un sustituto del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal de decodificación especulativa (draft head) sobre transformer; formato GGUF para llama.cpp |
| Parámetros totales | no disponible (el artefacto es un cabezal auxiliar; el modelo base VeriLoop-E2 tiene 27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo se distribuye en GGUF; no se detallan los niveles) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp / ik_llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un cabezal de predicción de tokens (dflash2_head.pt, exportado a GGUF) diseñado para decodificación especulativa con bloques de tamaño 8 (block_size: 8) y 512 bloques (n_blocks: 512). La evaluación publicada utiliza 512 anclas (anchors) sobre un conjunto de datos denominado xspark_data/harvest. El entrenamiento se realizó, según el autor, en una GPU de portátil, lo que constituye la principal innovación metodológica del experimento: demostrar que es posible entrenar un cabezal de este tipo con recursos de consumo.

El sistema se apoya en el toolkit propio del autor (toffee, repositorio github.com/damien1141/toffee) para el pipeline de evaluación (python -m toffee xspark eval). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La arquitectura subyacente del modelo base VeriLoop-E2 incorpora VeriLoop-Governed Recurrence (VGR), un mecanismo que separa la generación de la verificación, pero no se detalla cómo interactúa el cabezal dflash2 con dicho mecanismo.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa con bloques de 8 tokens sobre el modelo base VeriLoop-E2.
- Predicción de tokens candidatos (top-16) para su validación por el modelo objetivo.
- Integración con el ecosistema llama.cpp a través del fork ik_llama.cpp.
- Soporte de los idiomas del modelo base: inglés y chino.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento propias del cabezal; estas dependen del modelo base VeriLoop-E2.

## Casos de uso

- Aceleración de la generación en pipelines de código verificable: el cabezal propone tokens candidatos que el modelo base VeriLoop-E2 valida, reduciendo el número de pasos de decodificación en tareas de generación de código donde la latencia es crítica.
- Investigación en decodificación especulativa: sirve como banco de pruebas para estudiar la brecha entre recall y accept rate en cabezales de borrador, gracias a las métricas publicadas (recall@0 = 49,6 %, accept@0 = 15,6 %).
- Experimentación en hardware de consumo: permite reproducir el entrenamiento y la evaluación de un cabezal de este tipo en GPUs de portátil con ~12 GB de VRAM, un escenario poco explorado.
- Desarrollo sobre ik_llama.cpp: útil para desarrolladores que quieran validar la integración de cabezales MTP en este fork y comparar su comportamiento frente a llama.cpp estándar.
- Docencia y divulgación: las métricas de auto-evaluación y la tabla explicativa del autor facilitan explicar conceptos como recall@k, accept@k y oracle length en un contexto real.
- Prototipado de sistemas de razonamiento científico y matemático de largo horizonte: al heredar las capacidades del modelo base, puede emplearse en entornos de investigación donde se priorice la velocidad de iteración sobre la robustez de producción.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la auto-evaluación del cabezal sobre 512 anclas con el modelo objetivo VeriLoop-E2:

| Métrica | Valor | Interpretación (según el autor) |
|---|---|---|
| n_blocks | 512 | Número de bloques evaluados |
| block_size | 8 | Tokens por bloque |
| recall@0 | 0,496 (254/512) | El token verdadero está en el top-16 el 49,6 % de las veces |
| accept@0 | 0,156 (80/512) | El selector elige el token correcto el 15,6 % de las veces |
| accept@1 | 0,0156 | Aceptación en la segunda posición |
| accept@2 a accept@6 | 0,0 | Sin aceptación más allá de la primera posición |
| oracle_len | 2,068 | Longitud de aceptación si el selector siempre acertara |
| accept_len | 1,172 | Longitud de aceptación real |
| Brecha | 174 anclas | Casos en que la verdad estaba en la lista y el selector no la eligió |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto en la información disponible. El autor estima que se captura aproximadamente el 16 % del margen disponible del cabezal.

## Requisitos de hardware

- VRAM estimada: el autor indica que 12 GB de VRAM no son suficientes para verificar las tasas de aceptación con cachés KV completas; se requiere previsiblemente más de 12 GB para una evaluación fiable.
- GPU de entrenamiento utilizada: NVIDIA GeForce RTX 4080 Laptop GPU con 11,67 GB de VRAM.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del modelo base (27B) se requerirían GPUs de gama alta (A100, H100) para inferencia completa, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: el cabezal en sí es pequeño (repo de 1,5 GB), pero su uso conjunto con el modelo base de 27B excede la VRAM de GPUs de consumo típicas.
- Opciones de despliegue: ik_llama.cpp (recomendado por el autor); llama.cpp estándar no se menciona como compatible.
- Latencia y throughput: no disponibles; el autor no pudo medirlos por limitaciones de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VeriLoop-E2-Dflash2-experimental | Cabezal auxiliar (base 27B) | no disponible | Cabezal de decodificación especulativa | Apache 2.0 | Hugging Face (el4) |
| VeriLoop-E2 (modelo base) | 27B | no disponible | Modelo post-entrenado (VGR) | no disponible en la información | Hugging Face (tsinghua-sigs-robot-lab) |
| Cabezales de decodificación especulativa estándar (EAGLE, Medusa) | no disponible | no disponible | Cabezales de borrador | varía | no disponible |

No se dispone de datos comparativos de rendimiento con alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo describe como "experimental research artifact" y no garantiza su robustez.
- Tasas de aceptación no verificadas: el autor no pudo validar accept rates por falta de VRAM (cachés KV).
- Rendimiento limitado: accept_len de 1,172 frente a un oracle_len de 2,068; el selector desaprovecha el 84 % del margen teórico del cabezal.
- Aceptación nula más allá de la primera posición (accept@1 a accept@6 = 0), lo que limita la aceleración efectiva.
- Dependencia de un fork específico (ik_llama.cpp); no se garantiza compatibilidad con llama.cpp upstream.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación heredado del modelo base; el cabezal no incorpora mecanismos de verificación propios.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación en producción, se desaconseja su despliegue en entornos críticos.
- Sin datos de sesgos, composición del dataset de entrenamiento ni evaluación de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/el4/VeriLoop-E2-Dflash2-experimental
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Toolkit del autor (toffee): https://github.com/damien1141/toffee
- Fork ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Anuncio de VeriLoop E2 (foro Hugging Face): https://discuss.huggingface.co/t/veriloop-e2-release-27b-post-trained-model-and-full-gguf-precision-ladder-from-bf16-to-iq1-m/180723
- Repositorio veriloop (referencia externa): https://github.com/BenjaminL1/veriloop
