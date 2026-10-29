# ConceptModels/fmac-lobotomy

## Resumen

fMAC (Fractal Multi-Agent Cognitive Graph) es un modelo experimental publicado por el usuario ConceptModels en Hugging Face. No se trata de un LLM de uso general, sino de un proyecto de investigación de arquitecturas: implementa una variante de mezcla de expertos dispersa (sparse MoE) organizada en «nodos celulares» con un núcleo denso SwiGLU compartido, y emplea como mezclador de secuencia una «pirámide de memoria fractal» con QK-Norm y codificación posicional RoPE. Entre las técnicas que incorpora destacan el balanceo de expertos al estilo DeepSeek-V3 y un optimizador híbrido que combina Muon (para las lineales densas 2D) con AdamW (para los nodos MoE y los embeddings).

El repositorio, de 2,2 GB, documenta un entrenamiento de 4000 pasos (completado) con una pérdida final de 3,5641, lo que apunta a un modelo pequeño en fase muy temprana de desarrollo. Su relevancia actual es principalmente para investigadores interesados en arquitecturas alternativas: ofrece una implementación abierta (Apache 2.0) de ideas como grafos cognitivos multiagente fractales y esquemas de balanceo de expertos de última generación. No se han publicado benchmarks, datos de entrenamiento ni instrucciones de uso, por lo que no puede considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nodos celulares con núcleo denso SwiGLU compartido; sparse MoE con grafo cognitivo fractal multiagente (fMAC) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura sparse MoE, pero sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repositorio: 2,2 GB) |
| Optimizador | Híbrido: Muon (lineales densas 2D) + AdamW (nodos MoE y embeddings) |
| Pasos de entrenamiento | 4000 / 4000 |
| Pérdida final registrada | 3,5641 |

## Arquitectura y entrenamiento

La arquitectura combina varias ideas no estándar. Por un lado, los expertos MoE se organizan como «nodos celulares» que comparten un núcleo denso SwiGLU, lo que sugiere un diseño híbrido en el que parte del cómputo de alimentación hacia adelante es común y parte es condicional (enrutado por expertos). Por otro lado, el mezclador de secuencia no es una atención convencional, sino una «pirámide de memoria fractal» con QK-Norm y RoPE: la normalización de queries y keys (QK-Norm) se usa habitualmente para estabilizar el entrenamiento, y RoPE aporta la codificación posicional rotatoria. El etiquetado incluye «deepseek-v3-balancing», lo que indica que el balanceo de carga entre expertos sigue el enfoque auxiliary-loss-free popularizado por DeepSeek-V3.

El entrenamiento se ejecutó durante 4000 pasos con el optimizador híbrido Muon + AdamW. Muon es un optimizador basado en momentum con ortogonalización vía Newton-Schulz, adoptado recientemente por laborios como Moonshot AI; aplicarlo solo a las lineales densas 2D y reservar AdamW para nodos MoE y embeddings es una práctica coherente con los usos más recientes de este optimizador. No se ha publicado información sobre el número de tokens, la composición del dataset, el tokenizador ni si existió alguna fase de post-entrenamiento (SFT, RLHF o DPO): no disponible. La pérdida final de 3,5641 tras 4000 pasos sugiere un preentrenamiento breve, coherente con un artefacto de investigación más que con un modelo base convencional.

## Capacidades

- Generación de texto: no documentada. Dado el preentrenamiento corto (4000 pasos) y la ausencia de evidencia de ajuste por instrucciones, no puede asumirse generación coherente de texto largo.
- Razonamiento, código y matemáticas: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible; no hay evidencia de entrenamiento para uso de herramientas.
- Soporte de agentes: aunque el nombre del proyecto menciona «multi-agent cognitive graph», este término se refiere a la arquitectura interna (nodos/expertos organizados en grafo), no a capacidades de orquestación de agentes; no hay soporte de agentes documentado.
- Capacidades multilingües: no disponible; no se especifican idiomas ni tokenizador.
- Capacidades especiales: sirve como implementación abierta de técnicas concretas: balanceo de expertos estilo DeepSeek-V3, optimizador híbrido Muon + AdamW, QK-Norm con RoPE y una pirámide de memoria fractal como mezclador de secuencia.

## Casos de uso

Dado el estado experimental del modelo, los casos de uso realistas son de investigación y educación, no de producción:

- Investigación en balanceo de expertos MoE: el modelo permite estudiar en pequeño formato cómo se comporta el esquema de balanceo auxiliary-loss-free estilo DeepSeek-V3, midiendo la distribución de carga entre nodos celulares durante la inferencia.
- Comparación de optimizadores: al documentar explícitamente el uso de Muon para lineales densas 2D y AdamW para MoE y embeddings, es un banco de pruebas útil para replicar la configuración y comparar curvas de pérdida frente a AdamW puro en condiciones similares.
- Material educativo sobre arquitecturas alternativas: los componentes (SwiGLU compartido, QK-Norm, RoPE, pirámide de memoria fractal) sirven como ejemplo práctico para enseñar cómo se ensamblan técnicas modernas en una arquitectura no convencional.
- Punto de partida para experimentos de continuación de entrenamiento: se puede retomar el checkpoint de 4000 pasos para continuar el preentrenamiento con un dataset propio y observar la evolución de la pérdida desde 3,5641.
- Validación de ideas de memoria jerárquica: la «pirámide de memoria fractal» como mezclador de secuencia puede abstraerse, modificarse y evaluarse frente a atención estándar en tareas de dependencias a larga distancia.
- Prototipado de infraestructura de inferencia: al tratarse de una arquitectura personalizada, es un caso práctico para desarrollar cargadores de pesos y rutinas de inferencia adaptadas a modelos que no encajan en los backends estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica pública es la pérdida de entrenamiento (3,5641 en el paso 4000 de 4000), que no es comparable con evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con un repositorio de 2,2 GB, la inferencia debería ser viable en GPUs de consumo con 4-8 GB de VRAM según la precisión de los pesos (estimación propia a partir del tamaño del repo; no hay requisitos oficiales publicados).
- GPUs recomendadas: no se requieren aceleradoras de centro de datos (A100/H100); cualquier GPU moderna de gama media (por ejemplo, RTX 3060 de 12 GB o RTX 4060 de 8 GB) debería bastar con holgura, dado el tamaño del repositorio.
- Ejecución en GPU de consumo: sí, por tamaño debería caber incluso en portátiles con GPU dedicada; la ejecución en CPU es plausible pero no está confirmada.
- Opciones de despliegue: no confirmadas. Al tratarse de una arquitectura personalizada (nodos celulares, pirámide de memoria fractal), es probable que vLLM, llama.cpp, Ollama o TGI no la soporten de fábrica; lo más previsible es que sea necesario ejecutarla con código personalizado del autor o una implementación propia en PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen comparables directos publicados: no hay otros modelos públicos con «grafo cognitivo fractal» como arquitectura declarada. Como referencia, estos son modelos que comparten técnicas concretas con fMAC, aunque no son comparables en escala:

| Modelo | Parámetros | Contexto | Técnica compartida con fMAC | Licencia |
|---|---|---|---|---|
| fMAC (ConceptModels) | no disponible | no disponible | — | Apache 2.0 |
| DeepSeek-V3 | 671B (37B activos) | 128K | Balanceo de expertos auxiliary-loss-free que fMAC imita | Licencia propia de DeepSeek |
| Kimi K2 (Moonshot AI) | 1T (32B activos) | 128K | Optimizador Muon (variante MuonClip) | Licencia propia modificada |

La diferencia de escala es de varios órdenes de magnitud: fMAC es un experimento de investigación sin cifras de parámetros publicadas, mientras que los modelos citados son LLM de frontera con evaluaciones completas.

## Limitaciones y advertencias

- Estado experimental muy temprano: 4000 pasos de entrenamiento y una pérdida de 3,5641 indican un modelo apenas iniciado; la calidad de generación probablemente sea baja o directamente incoherente.
- Sin evidencia de post-entrenamiento (SFT, RLHF o DPO): no es apto como asistente conversacional ni para seguir instrucciones.
- Documentación mínima: no se publican datos de entrenamiento, tokenizador, longitud de contexto, idiomas ni instrucciones de uso, lo que dificulta reproducir el entorno correcto de inferencia.
- Sin validación comunitaria: 0 descargas en el momento de redactar esta ficha; nadie ha verificado de forma independiente que los pesos funcionen.
- Riesgo alto de alucinación y de salida sin sentido: inherente a un modelo sin evaluaciones y con tan poco entrenamiento.
- Sesgos: desconocidos; al no publicarse la composición del dataset, no es posible auditar sesgos de contenido.
- Posible incompatibilidad con el ecosistema estándar: la arquitectura personalizada probablemente requiera código específico, y no hay garantía de soporte en vLLM, llama.cpp, Ollama o TGI.
- Licencia: Apache 2.0 permite el uso comercial, la modificación y la redistribución; no se identifican restricciones de licencia para producción, aunque sí los riesgos técnicos descritos arriba.
- Sin pipeline asignado en Hugging Face, lo que impide su uso directo mediante las abstracciones estándar de la plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConceptModels/fmac-lobotomy
- Página del autor (ConceptModels): https://huggingface.co/ConceptModels/models
- Imagen incluida en la model card: https://cdn-uploads.huggingface.co/production/uploads/693f140bb1693bd71406e3ea/-83cz8BEOIp0MdFQrh-Ur.png
- Paper, blog, repositorio de código o demo: no disponible; no se han encontrado enlaces adicionales en la búsqueda web.
