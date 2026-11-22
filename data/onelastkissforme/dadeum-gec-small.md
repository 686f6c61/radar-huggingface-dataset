# onelastkissforme/dadeum-gec-small

## Resumen

dadeum-gec-small es un modelo de corrección gramatical, ortográfica y de espaciado para coreano, desarrollado por el usuario onelastkissforme como componente del proyecto dadeum, un corrector que se ejecuta localmente en el ordenador del usuario (concretamente en macOS). El modelo parte de KoBART (gogamza/kobart-base-v2) y se ha afinado para reescribir únicamente los fragmentos incorrectos de una frase, dejando intacto el resto del texto. Con 62,5 millones de parámetros y un tamaño de repositorio de 0,3 GB, está pensado para inferencia en CPU sin necesidad de GPU.

La propuesta diferencial es doble: por un lado, una licencia abierta (CC BY-SA 4.0) sobre pesos y código de inferencia, frente a correctores propietarios o servicios en la nube; por otro, un entrenamiento construido exclusivamente con texto y objetivos de licencia abierta, sin anotaciones generadas por proveedores de IA en los pares de entrenamiento. El modelo no supera al motor de reglas del que aprende, pero ofrece un artefacto único, portable y ejecutable en local.

Es relevante ahora porque cubre un nicho poco atendido: corrección coreana de bajo coste computacional, con licencia permisiva para integración en aplicaciones de escritorio, editores de texto o extensiones de navegador que requieran privacidad y funcionamiento sin conexión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder), 4 capas de encoder y 1 de decoder, anchura 768 |
| Parámetros totales | 62.455.344 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens por frase; textos más largos se dividen por finales de frase |
| Tipos de cuantización | no disponible (pesos safetensors en el repositorio) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY-SA 4.0 (pesos); el script `dadeum_correct.py` es MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BART reducido: 4 capas de encoder y 1 de decoder con anchura 768, derivado de KoBART (gogamza/kobart-base-v2) mediante recorte de capas (paso `clean_e4d1_init`) y posterior afinado en dos fases (`clean_e4d1`, con proporciones legacy_clean:60 y wiki_edits:7). La tarea es de text2text-generation: recibe una frase y devuelve una versión corregida.

Los datos de entrenamiento combinan dos fuentes de licencia abierta. La primera son correcciones generadas por el motor de reglas de dadeum sobre texto de nsmc (CC0), comentarios no etiquetados de kocohub, Wikipedia y Wikinews en coreano (CC BY-SA 4.0) y 정책브리핑 (KOGL Type 1), con las partes del motor ajustadas a datos anotados por IA desactivadas. La segunda son correcciones reales de editores de Wikipedia coreana extraídas del historial de páginas (CC BY-SA 4.0), filtradas para excluir frases de evaluación, cambios de contenido y alteraciones de números o escrituras extranjeras. No se usaron pares anotados por proveedores de IA.

La innovación técnica principal no está en la arquitectura sino en el pipeline de inferencia: cada cambio propuesto se evalúa mediante el margen de log-verosimilitud del propio modelo y solo se conserva si alcanza el umbral definido en `gating.json`. Además, una capa de guardas descarta cambios que afecten a caracteres no hangul o no ASCII, que añadan o eliminen dos o más caracteres, que modifiquen números o que salten tres o más jamo hacia una palabra ausente de la lista abierta `known_words.bin`. El script `dadeum_correct.py` implementa todo ello; una llamada directa a `generate()` omite el juicio y las guardas.

## Capacidades

- Corrección ortográfica en coreano (맞춤법).
- Corrección de espaciado entre palabras (띄어쓰기).
- Corrección gramatical, con especial énfasis en partículas.
- Edición mínima: reescribe solo los fragmentos erróneos y preserva el resto de la frase.
- Salida de ediciones estructuradas mediante el método `edits()`, que devuelve tuplas `(start, end, replacement)`.
- Filtrado por margen de verosimilitud y guardas heurísticas para evitar cambios no deseados.
- Procesamiento frase a frase, con segmentación automática de textos largos por finales de frase.
- Ejecución en CPU sin GPU, con latencia de 34 ms de mediana y 87 ms de p95 por frase en un Apple M4 Pro con 4 hilos.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un corrector especializado.

## Casos de uso

- Corrección integrada en editores de texto para macOS: el modelo puede ejecutarse en local dentro de una aplicación de escritorio y corregir ortografía y espaciado sin enviar el texto a un servidor, gracias a su tamaño de 0,3 GB y su inferencia en CPU.
- Extensiones de navegador para redes sociales y foros: al procesar una frase cada 34 ms de mediana, puede corregir comentarios antes de publicarlos en coreano sin introducir latencia perceptible.
- Preprocesado de corpus coreanos: aplicar `edits()` para normalizar espaciado y erratas en datasets de entrenamiento o en pipelines de NLP, conservando las ediciones como metadatos auditables.
- Herramientas de accesibilidad y dictado: corregir transcripciones de voz en coreano antes de mostrarlas al usuario, con la ventaja de que el procesamiento es local y no requiere conexión.
- Sistemas de gestión documental con requisitos de privacidad: corregir correos, informes o formularios en entornos donde el texto no puede salir de la máquina, como administraciones públicas o sector sanitario.
- Filtrado de calidad en plataformas de contenido generado por usuarios: detectar y corregir automáticamente erratas y espaciado en comentarios y reseñas antes de su publicación, usando las guardas para no alterar números, URLs ni texto en otros alfabetos.
- Asistencia a correctores humanos: presentar las ediciones propuestas con sus posiciones exactas para que un revisor las acepte o rechace, aprovechando el formato `(start, end, replacement)`.

## Benchmarks y rendimiento

Los resultados proceden de la model card y se midieron con F0.5 sobre ediciones de caracteres (ediciones contiguas fusionadas), contra un gold anotado por IA bajo la guía de anotación del autor; ese gold no se distribuye y su split de validación se usó para elegir el checkpoint y el umbral de `gating.json`, por lo que las cifras de validación son ligeramente optimistas.

| Medida | dadeum-gec-small | Motor de reglas dadeum |
|---|---|---|
| Mitad ciega de validación (1.196 frases), F0.5 (P / R) | .890 (.958 / .692) | .899 (.946 / .750) |
| Desarrollo (300 frases), F0.5 | .914 | .950 |
| Test en dominio (350 frases), F0.5 | .905 | .927 |
| Dominios sellados: reseñas, comentarios, política, peticiones (870), F0.5 | .811 | .863 |
| Dominios de confirmación (600), F0.5 | .805 | .831 |
| Noticias, negocios y comentarios, anotador único (799), F0.5 | .798 | .820 |
| Kor-Lang8 reconstruido, aprendices (2.000), F0.5 | .083 | .088 |
| Correo de trabajo correcto (27 frases y el correo completo), frases modificadas | 0 | no disponible |
| Frases limpias de Wikipedia (19.759), frases modificadas | 785 (645 solo espaciado) | 424 |
| Latencia por frase en CPU, Apple M4 Pro, 4 hilos | 34 ms mediana, 87 ms p95 | no disponible |

Comparativa con otros correctores coreanos sobre las mismas frases y el mismo scorer (F0.5):

| Sistema | Dominios sellados (870) | Dominios de confirmación (600) | Kor-Lang8 (2.000) |
|---|---|---|---|
| dadeum-gec-small | .811 | .805 | .083 |
| Motor de reglas dadeum | .863 | .831 | .088 |
| Claude Sonnet 5.5 con guía de anotación | .895 | .887 | no ejecutado |
| Qwen3-8B | .548 | .562 | .127 |
| KoGrammar distil (theSOL1) | .481 | .435 | .107 |
| KoGrammar base (theSOL1) | .476 | .439 | .104 |
| ET5 typos corrector (j5ng) | .408 | .347 | .102 |
| KoBART gec_kr (Soyoung97) | .216 | .187 | .266 |

No se encontró un leaderboard público coreano para esta tarea, por lo que la tabla es la del propio autor y no un ranking de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con 62,5 M de parámetros en fp32 ocupa aproximadamente 250 MB de memoria, y el repositorio completo pesa 0,3 GB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) puede ejecutarlo, pero no aporta ventaja práctica frente a CPU.
- Cabe en cualquier consumer GPU y en CPU de portátil; el autor reporta 34 ms de mediana y 87 ms de p95 por frase en un Apple M4 Pro con 4 hilos.
- Opciones de despliegue: transformers con PyTorch (dependencias declaradas: `torch` y `transformers`), junto con el script `dadeum_correct.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; dado el tamaño, la vía natural es transformers en CPU.
- Throughput estimado: no disponible más allá de la latencia por frase reportada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F0.5 dominios sellados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dadeum-gec-small | 62,5 M | 128 tokens por frase | .811 | CC BY-SA 4.0 | Hugging Face, ejecución en CPU |
| KoGrammar base (theSOL1) | no disponible | no disponible | .476 | no disponible | Hugging Face |
| KoGrammar distil (theSOL1) | no disponible | no disponible | .481 | no disponible | Hugging Face |
| ET5 typos corrector (j5ng) | no disponible | no disponible | .408 | no disponible | Hugging Face |
| KoBART gec_kr (Soyoung97) | no disponible | no disponible | .216 (pero .266 en Kor-Lang8) | no disponible | Hugging Face |

Frente a los correctores abiertos comparables, dadeum-gec-small obtiene el mejor F0.5 en los dominios sellados y de confirmación del conjunto de evaluación del autor, aunque pierde claramente en Kor-Lang8 frente a KoBART gec_kr. Frente a un LLM grande como Qwen3-8B, el modelo pequeño queda por debajo en dominios sellados (.811 frente a .548) pero muy por encima en coste computacional y privacidad. Claude Sonnet 5.5 con la misma guía de anotación lidera la tabla (.895), a costa de ser un servicio propietario en la nube.

## Limitaciones y advertencias

- El benchmark es del propio autor y favorece al modelo: el gold lo escribió Claude bajo su guía de anotación, premia ediciones mínimas y ningún humano lo revisó; los correctores que reescriben más puntúan bajo en él.
- Aprende del motor de reglas de dadeum y no lo supera; la aplicación dadeum sigue usando el motor de reglas. El valor del modelo es la licencia abierta y un único archivo ejecutable en CPU.
- Está pensado para escritura nativa. En escritura de aprendices corregida por personas (Kor-Lang8), donde las referencias reescriben frases enteras, apenas cambia nada y KoBART gec_kr rinde mucho mejor.
- Comparte los puntos ciegos del motor de reglas: corrige ortografía, espaciado y partículas mucho mejor que la elección de palabras o el estilo.
- Procesa una frase a la vez, hasta 128 tokens; los textos más largos se dividen por finales de frase, lo que puede romper la coherencia en documentos con puntuación atípica.
- En frases limpias de Wikipedia modificó 785 de 19.759 (645 solo espaciado), frente a 424 del motor de reglas, lo que indica cierta tendencia a introducir cambios innecesarios en texto ya correcto.
- La licencia CC BY-SA 4.0 es copyleft: obliga a compartir bajo la misma licencia las obras derivadas y exige atribución según `NOTICE`; conviene revisarla antes de integrarla en productos comerciales cerrados.
- Riesgo de alucinación limitado por las guardas (no altera números, alfabetos no hangul ni palabras fuera de `known_words.bin`), pero las guardas solo se aplican si se usa `dadeum_correct.py`; `generate()` directo las omite.
- Solo soporta coreano; no hay capacidades multilingües ni de otro tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onelastkissforme/dadeum-gec-small
- Modelo base KoBART: https://huggingface.co/gogamza/kobart-base-v2
- Repositorio del proyecto dadeum: https://github.com/zmflm0110/dadeum
