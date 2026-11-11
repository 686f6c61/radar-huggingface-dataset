# onelastkissforme/dadeum-gec-base

## Resumen

dadeum-gec-base es un modelo de corrección gramatical, ortográfica y de espaciado para coreano, desarrollado por el usuario onelastkissforme como componente del proyecto dadeum, un corrector que se ejecuta localmente en el ordenador del usuario. Se trata de un fine-tuning de KoBART (gogamza/kobart-base-v2) con 123,9 millones de parámetros, pensado para reescribir únicamente los fragmentos erróneos de una frase y dejar intacto el resto del texto.

El modelo aborda un problema concreto: los correctores basados en reglas tienen puntos ciegos y los grandes modelos generativos tienden a reescribir en exceso. dadeum-gec-base combina una generación seq2seq con un mecanismo de filtrado por margen de log-verosimilitud (`gating.json`) y una serie de guardas que descartan cambios que tocan caracteres no hangul o no ASCII, que añaden o eliminan dos o más caracteres, que alteran números o que introducen palabras ausentes de una lista abierta (`known_words.bin`).

Su relevancia radica en que está entrenado exclusivamente con texto y objetivos de licencia abierta, sin pares anotados por proveedores de IA, y en que su licencia CC BY-SA 4.0 permite reutilización con atribución. Está orientado a inferencia en CPU (120 ms de mediana por frase en un Apple M4 Pro con 4 hilos), lo que lo hace apto para aplicaciones de escritorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder), 6 capas de encoder y 6 de decoder, anchura 768 |
| Parámetros totales | 123.889.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens por frase; textos más largos se dividen en finales de frase |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY-SA 4.0 (el script `dadeum_correct.py` es MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BART estándar con 6 capas de encoder y 6 de decoder, anchura 768 y 123,9M de parámetros, inicializado desde KoBART (gogamza/kobart-base-v2). La tarea es text2text-generation: recibe una frase y devuelve una reescritura. La innovación no está en la arquitectura sino en el pipeline de corrección: cada cambio propuesto se evalúa con su propio margen de log-verosimilitud y solo se conserva si alcanza o supera el umbral definido en `gating.json`. Además, se aplican guardas que descartan ediciones sobre caracteres no hangul o no ASCII, que añadan o eliminen dos o más caracteres, que modifiquen números o que introduzcan palabras no presentes en `known_words.bin`.

El entrenamiento parte del modelo base y sigue la secuencia clean_full (legacy_clean:60, wiki_edits:7). Los datos son exclusivamente de licencia abierta: correcciones del motor de reglas de dadeum sobre nsmc (CC0), comentarios sin etiquetar de kocohub, Wikipedia y Wikinews en coreano (CC BY-SA 4.0) y 정책브리핑 (KOGL Type 1), con las partes del motor ajustadas a datos anotados por IA desactivadas; y correcciones de editores de Wikipedia coreana extraídas del historial de páginas (CC BY-SA 4.0), filtradas para excluir frases de evaluación, cambios de contenido y alteraciones de números o escrituras extranjeras. No se usó ningún par anotado por un proveedor de IA.

## Capacidades

- Corrección ortográfica en coreano (errores de escritura de jamo y sílabas).
- Corrección de espaciado entre palabras (띄어쓰기).
- Corrección gramatical limitada, con especial énfasis en partículas.
- Edición mínima: reescribe solo los fragmentos erróneos y preserva el resto de la frase.
- Salida de ediciones estructuradas mediante `corrector.edits()`, que devuelve tuplas `(start, end, replacement)`.
- Filtrado interno por margen de log-verosimilitud y guardas de seguridad sobre caracteres, longitud, números y vocabulario conocido.
- Procesamiento frase a frase de hasta 128 tokens, con división automática de textos largos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (no disponible en la información).

## Casos de uso

- Corrección integrada en editores de texto de escritorio: el modelo puede ejecutarse en local sobre CPU (120 ms de mediana por frase en un Apple M4 Pro) y corregir mientras el usuario escribe, sin enviar texto a servidores externos.
- Revisión de correos electrónicos profesionales: el modelo no modificó ninguna de las 27 frases de un correo limpio de entorno laboral, lo que lo hace adecuado para sugerencias de bajo riesgo en comunicación formal.
- Preprocesado de corpus coreanos: puede normalizar ortografía y espaciado en textos de Wikipedia, Wikinews o comentarios antes de usarlos en pipelines de NLP, reduciendo variabilidad no deseada.
- Herramientas de aprendizaje de coreano: dado que corrige errores de escritura y espaciado con alta precisión (F0.5 de .964 en la mitad ciega de validación), puede señalar errores frecuentes a estudiantes, aunque su cobertura en escritura de aprendices es baja (F0.5 de .089 en Kor-Lang8).
- Filtrado de calidad en plataformas de contenido generado por usuarios: puede marcar o corregir comentarios y reseñas con errores evidentes, si bien su rendimiento en dominios sellados baja a F0.5 de .820.
- Componente de un corrector híbrido: al compartir los puntos ciegos del motor de reglas de dadeum, puede combinarse con este último para cubrir casos donde el motor acierta y el modelo no (el motor obtiene .863 frente a .820 en dominios sellados).
- Corrección por lotes en CPU en entornos sin GPU: su tamaño (123,9M de parámetros, repo de 0,5 GB) permite desplegarlo en portátiles y servidores modestos.

## Benchmarks y rendimiento

Los resultados son los publicados por el autor, medidos con F0.5 sobre ediciones de caracteres con ediciones contiguas fusionadas, contra un gold anotado por IA no distribuido. La mitad de validación se usó para elegir el checkpoint y el margen, por lo que las puntuaciones de validación son ligeramente optimistas.

| Medida | Valor |
|---|---|
| Mitad ciega de validación (1.196 frases), F0.5 (P / R) | .890 (.964 / .682); motor de reglas dadeum: .899 (.946 / .750) |
| Desarrollo (300 frases), F0.5 | .918; motor de reglas: .950 |
| Test en dominio (350 frases), F0.5 | .904; motor de reglas: .927 |
| Dominios sellados (reseñas, comentarios, política, peticiones; 870 frases), F0.5 | .820; motor de reglas: .863 |
| Dominios de confirmación (600 frases), F0.5 | .803; motor de reglas: .831 |
| Noticias, negocios y comentarios (anotador único; 799 frases), F0.5 | .788; motor de reglas: .820 |
| Kor-Lang8 reconstruido (aprendices; 2.000 frases), F0.5 | .089; motor de reglas: .088 |
| Correo laboral correcto (27 frases y el correo completo) | 0 frases modificadas |
| Frases limpias de Wikipedia (19.759) | 694 modificadas, 602 solo de espaciado; motor de reglas: 424 |
| Latencia en CPU por frase, Apple M4 Pro, 4 hilos | 120 ms de mediana, 325 ms p95 |

Comparativa con otros correctores coreanos, misma métrica F0.5:

| Sistema | Dominios sellados (870) | Dominios de confirmación (600) | Kor-Lang8 (2.000) |
|---|---|---|---|
| dadeum-gec-base (este modelo) | .820 | .803 | .089 |
| Motor de reglas dadeum (la app) | .863 | .831 | .088 |
| Claude Sonnet 5.5 con guía de anotación | .895 | .887 | no ejecutado |
| Qwen3-8B | .548 | .562 | .127 |
| KoGrammar distil (theSOL1) | .481 | .435 | .107 |
| KoGrammar base (theSOL1) | .476 | .439 | .104 |
| ET5 typos corrector (j5ng) | .408 | .347 | .102 |
| KoBART gec_kr (Soyoung97) | .216 | .187 | .266 |

El autor indica que no encontró una clasificación pública coreana para esta tarea, por lo que la tabla es propia y no un ranking de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 123,9M de parámetros en safetensors (0,5 GB de repo), la inferencia en fp32 requiere aproximadamente 0,5 GB de pesos más activaciones, holgadamente por debajo de 2 GB.
- GPU recomendadas: no disponible; el autor valida el modelo en CPU (Apple M4 Pro, 4 hilos), lo que sugiere que cualquier GPU consumer es suficiente.
- Cabe en GPU consumer: sí, por tamaño, en cualquier GPU con al menos 2 GB de memoria; no se especifican modelos concretos.
- Opciones de despliegue: transformers con PyTorch (`pip install torch transformers`), mediante el script `dadeum_correct.py` del repositorio dadeum. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 120 ms de mediana y 325 ms p95 por frase en CPU con Apple M4 Pro y 4 hilos; no se publican cifras de throughput ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F0.5 dominios sellados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dadeum-gec-base | 123,9M | 128 tokens por frase | .820 | CC BY-SA 4.0 | Hugging Face |
| KoGrammar base (theSOL1) | no disponible | no disponible | .476 | no disponible | Hugging Face |
| KoGrammar distil (theSOL1) | no disponible | no disponible | .481 | no disponible | Hugging Face |
| ET5 typos corrector (j5ng) | no disponible | no disponible | .408 | no disponible | Hugging Face |
| KoBART gec_kr (Soyoung97) | no disponible | no disponible | .216 | no disponible | Hugging Face |
| Qwen3-8B | 8.000M (aprox.) | no disponible | .548 | no disponible | Hugging Face |

En Kor-Lang8, el orden se invierte: KoBART gec_kr lidera con .266 frente a .089 de este modelo, porque el gold de aprendices reescribe más y penaliza la edición mínima.

## Limitaciones y advertencias

- Aprende principalmente de las correcciones de un motor de reglas, por lo que hereda sus puntos ciegos; corrige mucho mejor ortografía, espaciado y partículas que elección léxica o estilo.
- Procesa una sola frase a la vez, con un máximo de 128 tokens; los textos más largos se dividen en finales de frase, lo que puede perder coherencia entre oraciones.
- La escritura de aprendices (estilo Lang-8) se corrige mucho menos que la de nativos: F0.5 de .089 en Kor-Lang8.
- Riesgo de alucinación no cuantificado; las guardas mitigan cambios no deseados, pero no se documenta una evaluación específica de falsos positivos semánticos.
- En dominios sellados y de confirmación rinde por debajo del motor de reglas (.820 frente a .863 y .803 frente a .831), por lo que no lo sustituye en todos los casos.
- Las puntuaciones de validación son ligeramente optimistas porque la mitad de validación se usó para elegir checkpoint y margen.
- Licencia CC BY-SA 4.0: el uso comercial exige atribución y compartir bajo la misma licencia las obras derivadas; las atribuciones están en `NOTICE`.
- No se han publicado datos sobre sesgos, cuantizaciones disponibles ni rendimiento en GPU.
- El pipeline declarado en Hugging Face es text-generation, pero la model card y los tags indican text2text-generation; conviene verificar la configuración antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onelastkissforme/dadeum-gec-base
- Repositorio dadeum (GitHub): https://github.com/zmflm0110/dadeum
- Modelo base KoBART: https://huggingface.co/gogamza/kobart-base-v2
