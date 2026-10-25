# dendriteholdings/Ingot-IX-27B-Q2

## Resumen

Ingot-IX-27B-Q2 es un modelo de lenguaje de aproximadamente 27.000 millones de parámetros (26.895.998.464 exactos, según los metadatos de safetensors) distribuido en formato GGUF y publicado por la organización dendriteholdings. No se trata de un modelo entrenado desde cero: es el espejo público de la submission ganadora de un minero en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia cuantizada que se mantiene más próxima al profesor original. Los pesos son la subida del minero, byte por byte.

El interés del modelo es doble. Por un lado, documenta un caso de cuantización extrema (el nombre Q2 y un repositorio de 7,2 GB para 26,9 B de parámetros apuntan a unos 2,1 bits por parámetro) evaluada no con benchmarks convencionales sino con métricas de fidelidad respecto al profesor: divergencia KL entre distribuciones de siguiente token e distancia de estados ocultos cada 8 capas. Por otro, su formato no es estándar: requiere el fork de llama.cpp de PrismML en un commit concreto (`e3de715`) y no funciona con llama.cpp de serie.

La relevancia práctica es acotada pero instructiva: sirve para estudiar el estado del arte en cuantización de 2 bits, para reproducir la evaluación de la subred y como ejemplo de empaquetado GGUF con rotación Hadamard. No hay información publicada sobre arquitectura del profesor, longitud de contexto, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. Modelo transformer (profesor de 27B en BF16) cuantizado; la model card no detalla la arquitectura del profesor |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Una única variante Q2 (nombre del modelo). Repositorio de 7,2 GB para 26,9 B de parámetros, equivalente a ~2,1 bits por parámetro (dato derivado, no declarado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (`Ingot-IX-27B-Q2.gguf`); layout, tokenizer y rotación Hadamard heredados de `Ingot-genesis-27B-Q2` |
| Runtime requerido | Fork de llama.cpp de PrismML en el commit `e3de715222b2667c54a267441159a5729f11155e`; llama.cpp de serie no lo ejecuta |
| Modalidad | Texto (el archivo es el modelo de texto). Visión opcional añadiendo un `mmproj` externo |
| Procedencia | Submission del minero con hotkey `5FHoQiL4CRLCVEWKX6by9aGExiz7WxRWyBtUJKN5uwyi6iyU` (uid 197), submission `2c80dc33-ca61-494d-bda3-46bcd3642fb0` |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

No hay información publicada sobre el entrenamiento del modelo profesor: la model card no indica número de tokens, composición del dataset, ni si hubo RLHF o DPO. Lo que sí se describe es el proceso de cuantización, que es el objeto real del modelo. Los mineros de la subred Ingot reciben un profesor fijo en BF16 y producen copias cuantizadas; el validador corona la copia que permanece más cerca del profesor, medida con dos métricas por token de respuesta: la divergencia KL entre la distribución de siguiente token del profesor y la del modelo, y la distancia relativa de estados ocultos `|h − h_teacher| / |h_teacher|` promediada cada 8 capas.

Técnicamente, el GGUF incorpora una rotación Hadamard (procesamiento incoherente, en la línea de técnicas tipo QuaRot) que reparte los valores atípicos antes de cuantizar, junto con un tokenizer y un layout propios heredados de `Ingot-genesis-27B-Q2`. Esa combinación es la razón de que el archivo no cargue en llama.cpp estándar: el fork de PrismML introduce el soporte necesario para ese layout y esa rotación. La variante de visión no forma parte del modelo: se obtiene acoplando el torre de visión de `prism-ml/Ternary-Bonsai-2-27B-gguf` como `mmproj`, que fue construido para genesis y cuya calidad con estos pesos no ha sido evaluada.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el uso de `--jinja` indican plantilla de chat compatible con llama-server.
- Fidelidad alta al profesor para su nivel de compresión: KL de 0,10294 frente a 0,10452 del modelo al que destronó, y 20,1 % mejor que genesis en esa métrica.
- Preservación de representaciones internas: distancia de estados ocultos de 0,3201, un 29,4 % mejor que genesis, lo que sugiere que no solo imita la salida superficial sino parte de la geometría interna.
- Capacidad multimodal opcional (experimental): acepta entrada de imagen si se le añade el `mmproj` Q8_0 o BF16 de Ternary-Bonsai-2. Calidad no medida.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue vía llama-server con API compatible con OpenAI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento o thinking explícito: no disponible.
- Cobertura multilingüe: no disponible; los idiomas no están declarados.
- Comportamiento agéntico multi-paso: no disponible ni evaluado por la subred, que solo puntúa fidelidad de distribución.

## Casos de uso

- Investigación en cuantización extrema: usar el par (profesor BF16, este Q2) para medir qué se pierde a ~2 bits por parámetro con métricas de KL y de estados ocultos, replicando la evaluación de Ingot sobre dominios propios.
- Reproducción y auditoría de la subred: verificar de forma independiente las puntuaciones declaradas (KL 0,10294; distancia 0,3201) compilando el fork de PrismML en el commit exacto y ejecutando la misma eval.
- Baseline de compresión para nuevos mineros: servir como referencia ("the king") contra la que comparar cuantizaciones candidatas antes de subirlas a la subred.
- Despliegue de bajo coste en una sola GPU de consumo: con 7,2 GB de pesos cabe en tarjetas de 12 GB, lo que permite montar un servicio conversacional en hardware Barato sin renunciar a un modelo de 27B.
- Prototipado de asistentes conversacionales autoalojados: con llama-server y `--jinja` se obtiene un endpoint HTTP compatible con clientes de API OpenAI para pruebas de integración.
- Experimentos multimodales exploratorios: acoplar el `mmproj` de Ternary-Bonsai-2 para probar descripción de imágenes, asumiendo que la calidad no está garantizada y que el modelo de texto no fue entrenado contra ese proyector.
- Docencia y divulgación: caso de estudio real de cómo una competición de quantización con métricas objetivas produce artefactos publicables y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son las de fidelidad respecto al profesor:

| Métrica | Ingot-IX-27B-Q2 | "King" al que destronó | Mejora vs genesis-27B-Q2 |
|---|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,10294 | 0,10452 | 20,1 % más cercano |
| Distancia de estados ocultos (cada 8 capas) | 0,3201 | 0,3264 | 29,4 % más cercano |

Menor es mejor en ambas métricas. No se especifica el conjunto de evaluación, el número de respuestas ni la longitud media evaluada.

## Requisitos de hardware

- VRAM para los pesos: 7,2 GB (tamaño del archivo GGUF). Con caché KV y buffers de llama.cpp, el consumo realista arranca en torno a 9-11 GB, en función de la longitud de contexto configurada.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RX 7900 XTX. No cabe en tarjetas de 8 GB sin descargar capas a CPU.
- GPU de datacenter: A100 40/80 GB, H100, L40S, A6000; sobran recursos, por lo que el límite práctico pasa a ser el throughput y no la memoria.
- Compilación obligatoria: `cmake -B build -DGGML_CUDA=ON && cmake --build build -j` sobre el fork `PrismML-Eng/llama.cpp` en el commit `e3de715222b2667c54a267441159a5729f11155e`. Ejecución típica: `build/bin/llama-server -m Ingot-IX-27B-Q2.gguf -ngl 99 -fa on --jinja`.
- Opciones de despliegue: solo llama.cpp de PrismML (llama-server). No hay soporte declarado en vLLM, TGI, Ollama, LM Studio ni llama.cpp upstream, al menos en el commit indicado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.
- Almacenamiento: ~7,2 GB para el GGUF de texto más ~1-2 GB adicionales si se añade el `mmproj` de visión.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / bits | Contexto | Métrica de fidelidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ingot-IX-27B-Q2 | ~26,9 B | GGUF, Q2 (~2,1 bits/param) | No disponible | 0,10294 (distancia oculta 0,3201) | No disponible | Fork PrismML, commit `e3de715` |
| dendriteholdings/Ingot-genesis-27B-Q2 | ~27 B | GGUF, Q2 | No disponible | 20,1 % peor en KL y 29,4 % peor en distancia oculta | No disponible | Fork PrismML |
| "King" previo (sin identificar en la model card) | ~27 B | No disponible | No disponible | 0,10452 (distancia oculta 0,3264) | No disponible | No disponible |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B | GGUF ternario | No disponible | No disponible | No disponible | Stock/fork de llama.cpp (no confirmado) |

La comparación con modelos de propósito general (Qwen, Llama, Mistral en 27-32B) no es posible con los datos disponibles: no hay benchmarks de tareas, ni contexto, ni licencia declarada de este modelo. La comparativa relevante es interna a la competición Ingot.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir uso comercial. Además, los pesos derivan de un modelo profesor cuya licencia tampoco se indica, lo que añade una capa de incertidumbre legal.
- Métrica de selección != calidad de instrucciones: el modelo fue coronado por parecerse al profesor en distribución de tokens y estados ocultos, no por seguir instrucciones, reasoning o seguridad. Un KL bajo no garantiza ausencia de degradación cualitativa a 2 bits.
- Dependencia de un fork y un commit concreto: el despliegue en producción obliga a fijar `PrismML-Eng/llama.cpp@e3de715`. Eso implica riesgo de cadena de suministro, falta de parches de seguridad posteriores y ausencia de soporte en el ecosistema estándar (vLLM, TGI, Ollama).
- Visión no validada: el `mmproj` es de otro modelo (Ternary-Bonsai-2) y fue creado para genesis; el autor lo dice explícitamente. La calidad de imagen es desconocida y no fue puntuada por la subred.
- Contexto desconocido: no se publica la longitud de contexto del profesor ni la efectiva tras la cuantización, por lo que no se puede planificar un caso de uso con ventanas largas.
- Idiomas desconocidos: no hay declaración de cobertura; no se puede asumir buen rendimiento en castellano sin evaluarlo.
- Riesgo de alucinación: inherente al profesor y potencialmente amplificado por un esquema de 2 bits, especialmente en colas de distribución y tokens poco frecuentes.
- Sesgos: no documentados. Al no conocerse el dataset del profesor, no hay forma de auditar sesgos de género, etnia o ideología.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni validación comunitaria independiente.
- Fechas de creación y actualización (2026-10-25) separadas por diez segundos, típico de una subida automatizada sin revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-IX-27B-Q2
- Modelo base de referencia (genesis): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp usado en la evaluación: https://github.com/PrismML-Eng/llama.cpp
- Commit exacto: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Torre de visión / proyector: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf

Nota: la búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con él y se han descartado. No se dispone de paper, blog técnico ni demo asociados.
