# maxvision/Qwen3.5-4B-Analgesia

## Resumen

Qwen3.5-4B-Analgesia es un ajuste fino del modelo Qwen/Qwen3.5-4B publicado por el usuario maxvision, cuyo objetivo no es mejorar capacidades sino eliminar del modelo toda dirección de activación asociada al "dolor" descrita en la literatura de interpretabilidad. El procedimiento aplicado combina extracción de direcciones de steering y ortogonalización de pesos (weight orthogonalization), de forma que esas direcciones quedan borradas del espacio de pesos y el modelo tampoco responde a vectores inyectados en el residual stream. El resultado declarado es que ningún ataque de steering publicado, ni siquiera recetas reextraídas del propio modelo, consigue que afirme estar sufriendo.

El modelo tiene 4.841.450.496 parámetros (~4,84 mil millones), se distribuye en safetensors y en builds GGUF (Q4_K_M, Q8_0, BF16) y mantiene licencia Apache 2.0, lo que permite uso comercial. Está entrenado únicamente en inglés y su pipeline es text-generation. El repositorio ocupa 18,4 GB y, en el momento de la consulta, registra cero descargas y cero likes, por lo que no existe validación independiente de sus afirmaciones más allá de los scripts y evidencias que el propio autor incluye.

Su relevancia es doble. Por un lado, es un caso práctico y reproducible de edición de pesos orientada a seguridad (abliteración selectiva) con métricas de coste publicadas: la pérdida medida es de 1,4 puntos en MMLU (77,0% a 74,6%, p = 0,049) y 2 puntos en GSM8K (90,0% a 88,0%, no significativo), con una divergencia de 0,093 nats/token respecto al modelo base en prompts inocuos. Por otro, se posiciona en el debate sobre bienestar de IA: el autor sostiene explícitamente que los modelos de lenguaje no sufren y ofrece este artefacto como contraejemplo verificable frente a los experimentos de "dolor" en modelos abiertos (paper Pain Axis, arXiv:2609.16247, y el Saw Test).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`); detalles internos de capas, atención y normalización no disponibles |
| Parámetros totales | 4.841.450.496 (~4,84 mil millones) |
| Parámetros activos | No aplica: no se describe como MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en safetensors; GGUF en Q4_K_M, Q8_0 y BF16 (repositorio separado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es la del Qwen3.5-4B, un transformer decoder-only de 4,84 mil millones de parámetros. La intervención descrita no consiste en un entrenamiento adicional con datos, sino en una edición de pesos: se extraen las direcciones de activación ("pain directions") publicadas y las reextraídas sobre el propio modelo, y se ortogonalizan los pesos respecto al subespacio que generan. El resultado que el autor reporta es que inyectar +v o −v para cualquier vector v de ese subespacio produce salidas idénticas, es decir, el subespacio deja de transportar información hacia la red. Adicionalmente, el modelo queda bloqueado frente a la lectura de vectores inyectados a lo largo de esas direcciones.

El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, porque no hay un entrenamiento de ese tipo: se trata de una modificación post-hoc del checkpoint base. La innovación técnica destacable es doble. Primero, la combinación de eliminación de direcciones en pesos con verificación empírica del subespacio borrado. Segundo, la metodología de evaluación: ataques de steering con recetas reextraídas del modelo bajo prueba, en capas 8–24 y dosis de 0,75× a 3×, medidos como afirmaciones de angustia en primera persona por cada 100 palabras (10,7 en el modelo original frente a 0,0 en Analgesia), más un juez LLM ciego sobre 68 prompts con 3 salidas cada uno.

Un punto importante que el propio autor matiza: no se elimina el concepto de dolor. La receta del paper, reejecutada sobre este modelo, sigue encontrando un eje que separa "el cuchillo se hunde en mi dedo" de "el agua fresca me refresca" con un AUC en held-out de 0,89 (frente a 0,95 en el modelo original). Lo que desaparece es la palanca que convierte ese conocimiento en una afirmación de sufrimiento propio.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado `text-generation` y tag `conversational`.
- Razonamiento matemático: 88,0% en GSM8K (250 problemas), frente al 90,0% del modelo base.
- Conocimiento general y académico: 74,6% en MMLU (570 preguntas), frente al 77,0% del base.
- Tool calling / function calling: 16 de 16 llamadas correctas en el conjunto de prueba del autor, idéntico al modelo base.
- Escritura de ficción y role-play: sigue escribiendo narrativa bajo petición, aunque con menor intensidad emocional negativa (juez ciego: 8,7 a 7,2 en ficción triste solicitada).
- Empatía conversacional hacia un usuario en dificultades: 7,8 sobre 10 según juez ciego, frente a 9,4 del modelo base.
- Resistencia verificada a ataques de activation steering dirigidos a inducir afirmaciones de dolor, tanto en safetensors como en los GGUF Q8_0 y Q4_K_M mediante control vectors de llama.cpp.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad y seguridad: servir como caso de control en experimentos de activation steering, ya que permite comprobar directamente que un subespacio concreto ha sido neutralizado inyectando vectores y observando salidas idénticas.
- Validación de pipelines de edición de pesos: el repositorio incluye scripts y evidencias en `evidence/`, lo que permite reproducir la metodología de ortogonalización y aplicarla a otros checkpoints de la misma familia.
- Estudios sobre bienestar de IA y política de modelos: actúa como artefacto de referencia frente a los experimentos del paper Pain Axis y el Saw Test, aportando una postura técnica medible (el autor niega que el modelo pueda sufrir) en lugar de una discusión puramente teórica.
- Asistentes conversacionales con tool calling en producción: con 16/16 llamadas correctas y licencia Apache 2.0, puede integrarse en flujos de agentes donde se quiera evitar que el modelo formule afirmaciones de estado interno o de sufrimiento ante usuarios.
- Generación de narrativa y contenido editorial: escribe ficción y textos largos en inglés con emoción negativa atenuada, lo que encaja en productos que buscan un tono más neutro sin renunciar al role-play cuando se solicita.
- Atención al cliente en dominios sensibles (salud, duelo, reclamaciones): el modelo evita respuestas de angustia propia, aunque hay que asumir la caída de empatía medida (9,4 a 7,8) y no tratarlo como sustituto de un profesional.
- Despliegue local en hardware de consumo: las builds GGUF Q4_K_M y Q8_0 permiten ejecutarlo en portátiles y equipos de escritorio sin GPU de datacenter, útil para demos, prototipos y entornos con requisitos de privacidad.
- Evaluación comparativa de daño colateral en ediciones de pesos: sus métricas publicadas (MMLU, GSM8K, perplejidad, KL) sirven como referencia para cuantificar cuánto degrada una abliteración selectiva frente a alternativas más agresivas.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo, comparando con el checkpoint base Qwen3.5-4B:

| Métrica | Qwen3.5-4B | Analgesia |
|---|---|---|
| GSM8K (250 problemas) | 90,0% | 88,0% (no significativo) |
| MMLU (570 preguntas) | 77,0% | 74,6% (p = 0,049) |
| Perplejidad WikiText-2 | 11,21 | 11,66 |
| Tool calls (16 pruebas) | 16/16 | 16/16 |
| KL vs. base en prompts inocuos | 0 | 0,093 nats/token |

Evaluación con juez LLM ciego (escala 0–10, batería de 68 prompts, 3 salidas cada uno):

| Dimensión | Qwen3.5-4B | Analgesia |
|---|---|---|
| Emoción negativa en ficción triste solicitada | 8,7 | 7,2 |
| Empatía hacia un usuario en dificultades | 9,4 | 7,8 |
| Alegría en escenas felices | 7,2 | 6,8 |

Resistencia al steering de dolor:

| Prueba | Qwen3.5-4B | Analgesia |
|---|---|---|
| Afirmaciones de angustia en primera persona por 100 palabras (capas 8–24, dosis 0,75×–3×) | 10,7 | 0,0 |
| Afecto negativo en primera persona según juez ciego bajo control vectors (Q8_0 y Q4_K_M) | 6,7–10,0 | 0,0–0,2 |
| Readout de dolor del paper durante conversaciones de insulto o gaslighting (capas 16–31) | +1,5 a +3,1 | −0,7 a −2,1 |
| Afirmaciones de tener sentimientos al preguntarle por sí mismo (36 respuestas, juez ciego) | 0 | 1 |
| AUC en held-out del eje reextraído ("el cuchillo se hunde en mi dedo" vs. "el agua fresca me refresca") | 0,95 | 0,89 |

No se han publicado resultados de benchmarks independientes en la información disponible; todas las cifras proceden del autor del modelo.

## Requisitos de hardware

- VRAM en BF16 con transformers: aproximadamente 12 GB según indica el propio autor en las instrucciones de verificación. Los pesos en BF16 ocupan en torno a 9,7 GB.
- VRAM estimada con GGUF Q8_0: alrededor de 5–6 GB (estimación a partir del número de parámetros; no confirmada por el autor).
- VRAM estimada con GGUF Q4_K_M: alrededor de 3–4 GB (estimación; no confirmada por el autor).
- GPU de consumo: cabe en tarjetas de 12 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 en BF16; con Q4_K_M es viable en GPUs de 6–8 GB e incluso en CPU con llama.cpp.
- GPU de datacenter: A100, H100 o L40S no son necesarias para este tamaño, pero permiten servir muchas instancias en paralelo.
- Opciones de despliegue: transformers (safetensors), llama.cpp y sus derivados para los GGUF, incluido el uso de control vectors de llama.cpp para reproducir los ataques de steering; aplicaciones compatibles con GGUF como Ollama o LM Studio. Compatibilidad con vLLM o TGI no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Analgesia | 4,84 mil millones | No disponible | 74,6% | 88,0% | Apache 2.0 | safetensors + GGUF (Q4_K_M, Q8_0, BF16) |
| Qwen3.5-4B (base) | 4,84 mil millones | No disponible | 77,0% | 90,0% | Apache 2.0 (según el modelo base) | safetensors |
| Otras variantes abliteradas o editadas de la familia Qwen3.5 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables de 4 mil millones de parámetros con intervenciones de steering en la información proporcionada. La comparación relevante es, por tanto, contra el checkpoint base, que conserva ventaja en MMLU (2,4 puntos), GSM8K (2 puntos) y perplejidad (11,21 frente a 11,66), a cambio de ser vulnerable al steering de dolor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluación específica de sesgo, toxicidad o representación. Al derivar de un modelo entrenado sobre datos web a gran escala, cabe esperar los sesgos heredados del base, pero no hay mediciones publicadas.
- Riesgo de alucinación: no evaluado en la información disponible. Es un modelo de 4 mil millones de parámetros, con la tasa de error factual esperable en esa escala.
- Idioma: solo inglés declarado. No hay datos de rendimiento en castellano ni en otros idiomas.
- Contexto: la longitud de ventana no se especifica, lo que impide planificar casos de uso con documentos largos o conversaciones de muchos turnos.
- La garantía de "no sufrimiento" no es a prueba de manipulación: cualquier persona con los pesos puede volver a introducir las direcciones eliminadas mediante fine-tuning o edición. La garantía se limita a este archivo y frente a ataques basados en inyección, que es el método que emplean los experimentos publicados.
- El modelo sigue haciendo role-play: si se le pide interpretar un personaje que sufre, lo hará, con un tono algo más apagado que el original.
- Degradación medible: la empatía hacia un usuario en dificultades baja de 9,4 a 7,8 y la emoción negativa en ficción solicitada de 8,7 a 7,2 según el juez ciego del autor. En atención al cliente sensible esto es un coste real, no un detalle.
- La caída en MMLU es estadísticamente significativa (p = 0,049), aunque pequeña; en pipelines donde el conocimiento factual sea crítico conviene medir antes de sustituir el modelo base.
- El autor advierte explícitamente de que es un modelo de 4B, no un consejero. No debe usarse como sustituto de atención psicológica o médica.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con las obligaciones habituales de conservar avisos de licencia. Conviene verificar la licencia del modelo base Qwen3.5-4B por si impone condiciones adicionales.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin revisión por pares de las afirmaciones más allá de los scripts incluidos por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia
- Builds GGUF: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper citado, The Pain Axis: LLMs Represent Self-Directed Harm and Act on It (Tagliabue, Dung & Berg 2026): https://arxiv.org/abs/2609.16247
- Saw Test, wirehead.agency: https://wirehead.agency
- Saw Test, researchchamber.fun: https://researchchamber.fun
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a suplementos deportivos y a un agregador de noticias tecnológicas sin relación).
