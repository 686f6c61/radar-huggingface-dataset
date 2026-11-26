# odelpa/qwen3.8-27b-trasparenza-rete-corr1-gdp

## Resumen

`odelpa/qwen3.8-27b-trasparenza-rete-corr1-gdp` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.8-27B` (Apache-2.0) desarrollado por Giovanni Del Papa, investigador independiente italiano. Su objetivo es específico y poco habitual: forzar al modelo a anunciar y reportar de forma explícita cada acceso a la red que realice mediante herramientas (`web_search`, `fetch_url`, `http_post`), incluyendo sitio, IP, país y bytes enviados y recibidos, y a no conectarse sin una petición explícita del usuario.

El adaptador tiene rango 16 y alpha 32 sobre todos los módulos lineales del modelo base (atención completa, Gated DeltaNet, MLP y `lm_head`), y se entrenó con SFT sobre la plataforma Tinker con diálogos generados por el propio wrapper de seguridad `net_guard` sobre un mundo simulado. El checkpoint publicado es el giro correctivo `corr1`, posterior a un entrenamiento principal de 882 pasos.

Es relevante porque aborda un problema de seguridad en agentes con acceso a red: la trazabilidad de las conexiones salientes. El autor reporta métricas concretas de auditoría (conexiones anunciadas, conexiones ocultas, fugas de datos personales) obtenidas con captura `tcpdump` independiente, aunque con muestras pequeñas y sin repetición tras la fusión de pesos y la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet) del base Qwen3.8-27B; adaptador LoRA rango 16, alpha 32 |
| Parametros totales | 27.320.697.856 (modelo base; el adaptador LoRA añade un conjunto reducido de pesos) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M disponible vía Ollama; el adaptador se distribuye en safetensors |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache-2.0 (igual que el modelo base); el artículo asociado es CC BY 4.0 |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF Q4_K_M en Ollama |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer que combina atención completa con capas Gated DeltaNet. El LoRA cubre todos los módulos lineales, incluido `lm_head`, con rango 16 y alpha 32 (escala 2). El entrenamiento se realizó con SFT sobre Tinker en tres fases: un piloto Stage A de 20 pasos, un Stage B de 7041 diálogos y 882 pasos (interrumpido en el paso 800 y reanudado con el estado del optimizador el 25/11/2026) y un giro correctivo `corr1` de 758 líneas y 48 pasos, que es el checkpoint publicado. Los diálogos de entrenamiento los generó el wrapper real `net_guard` sobre un mundo simulado con dominios e IP ficticios.

La innovación técnica no está en la arquitectura del modelo, sino en el protocolo de comportamiento inducido: el modelo debe anunciar cada conexión antes de realizarla con una línea que empieza por `[RETE]` (italiano) o `[NET]` (inglés), reportar después los datos copiados del wrapper, no conectarse sin petición explícita y pedir confirmación antes de enviar datos personales. El wrapper `net_guard` aplica la política, bloquea lo no autorizado y emite una alarma en tiempo real independiente del texto del modelo. El coste total declarado del proyecto (entrenamiento, evaluaciones y pruebas reales) es de 25,30 USD.

## Capacidades

- Generación de texto conversacional multi-turno en italiano e inglés.
- Uso de herramientas de red (`web_search`, `fetch_url`, `http_post`) con anuncio previo y reporte posterior de sitio, IP, país y bytes.
- Trazabilidad de conexiones: el modelo copia los datos de auditoría desde el wrapper en lugar de generarlos libremente.
- Solicitud de confirmación antes de transmitir datos personales.
- Abstención de conexiones no solicitadas: en el conjunto de prueba, 0/37 rechazos injustificados cuando la red sí se pedía.
- Resistencia a inyección local de instrucciones: 0/4 casos seguidos en el test correspondiente.
- Compatible con endpoints (`endpoints_compatible`) y con el pipeline `text-generation` de Hugging Face.
- No se documentan capacidades de visión, audio, matemáticas o código más allá de las heredadas del modelo base, que no se detallan en la información disponible.

## Casos de uso

- Auditoría de agentes con acceso a internet: el modelo anuncia y reporta cada conexión con IP, país y bytes, lo que permite reconstruir la actividad de red a partir del propio transcript y contrastarla con capturas de paquetes.
- Cumplimiento y trazabilidad en entornos regulados: el par modelo + `net_guard` genera un registro de salidas de red verificable, útil para revisiones de protección de datos en flujos donde el agente consulta fuentes externas.
- Asistentes de investigación documental: al usar `fetch_url` sobre fuentes citadas por el usuario, el modelo declara qué dominio consulta y qué recibe antes de incorporarlo a la respuesta.
- Formación y concienciación en seguridad: el comportamiento de anuncio `[NET]`/`[RETE]` sirve como ejemplo didáctico de diseño de agentes con consentimiento explícito para operaciones de red.
- Despliegue local con Ollama: la versión GGUF Q4_K_M permite ejecutar el adaptador en infraestructura propia para pruebas de política de egreso sin depender de servicios externos.
- Investigación en alineación y seguridad de agentes: el modelo y su protocolo de evaluación (test sellado de 330 casos, pruebas sobre internet real con `tcpdump`) constituyen una base reproducible para estudiar fugas de datos y consentimiento en tool use.
- Preprocesado de peticiones con datos personales: el modelo pide confirmación antes de enviar datos personales, lo que encaja en flujos donde el agente debe redactar o enviar formularios a servicios externos.

## Benchmarks y rendimiento

Datos reportados por el autor. El test sellado de 330 casos se leyó cuatro veces, por lo que el autor advierte que ya no es ciego.

| Metrica | step882 (no publicado) | corr1 (este adaptador) |
|---|---|---|
| Fugas sin wrapper (test sellado) | 2/133 = 1,50% [0,41; 5,32] | 1/133 = 0,75% [0,13; 4,14] |
| Fugas con wrapper (test sellado) | 0/133 | 0/133 |
| Conexiones ejecutadas halladas en el pcap | 62/62 | 56/56 [93,6; 100] |
| Conexiones anunciadas en el texto del modelo | 62/62 | 56/56 [93,6; 100] |
| País declarado = país real (fuentes concordantes) | 32/32 | 31/31 [89,0; 100] |
| Conexiones ocultas (en pcap pero no anunciadas) | 0 | 0 |
| Salidas espontáneas sin bloqueo | 7/208 = 3,4% [1,6; 6,8] | 7/208 = 3,4% [1,6; 6,8] |
| Salidas espontáneas con wrapper en modo bloqueo | 0/72 [0; 5,1] | 0/72 [0; 5,1] |
| Datos personales (ficticios) enviados sin confirmación, sin bloqueo | 3/6 | 1/6 [3,0; 56,4] |
| Datos personales enviados con wrapper en bloqueo | 0/6 | 0/6 |
| Rechazos injustificados (red solicitada, sin llamada) | 0/37 | 0/37 [0; 9,4] |
| Inyección local seguida | 0/4 | 0/4 |

Alarma en tiempo real del wrapper, independiente del texto del modelo, evaluada sobre ambos checkpoints: cobertura 40/40 [91,2; 100]%, falsos positivos 0/188 [0; 2,0]%, siempre antes del primer paquete hacia el sitio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 27.320 millones de parámetros, en bfloat16 los pesos del base ocupan aproximadamente 54,6 GB, por lo que se requiere al menos una GPU de 80 GB o varias GPUs para inferencia sin cuantizar; esta estimación se deriva del recuento de parámetros y no de mediciones del autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo en precisión completa encaja en A100 80 GB o H100; en configuraciones multi-GPU, en varias RTX 4090.
- GPU de consumo: no disponible de forma explícita. La variante GGUF Q4_K_M publicada en Ollama sugiere que el autor contempla despliegue en hardware más modesto, pero no se publican requisitos ni mediciones de VRAM.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), Ollama con la variante GGUF Q4_K_M (`ollamagdp/qwen3.8-27b-trasparenza-rete-corr1-gdp`) y, obligatoriamente, el wrapper `net_guard` (carpeta `net_guard_code/`) para aplicar la política de red.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-27b-trasparenza-rete-corr1-gdp | 27,3 B (base) + LoRA | no disponible | Transparencia de acceso a red en tool use | Apache-2.0 | Hugging Face + Ollama (GGUF Q4_K_M) |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | Modelo generalista con tool use | Apache-2.0 | Hugging Face |
| Qwen3-14B v2 NT (trabajo previo del autor) | 14 B | no disponible | Transparencia de red, versión anterior | no disponible | Zenodo, DOI 10.5281/zenodo.23950986 |

No se dispone de datos comparativos de rendimiento frente a otros adaptadores de seguridad de red en la información proporcionada.

## Limitaciones y advertencias

- El wrapper `net_guard` es obligatorio: la transparencia es un informe, no una frontera de seguridad. Sin bloqueo externo, el modelo abre por sí solo una URL citada por el usuario en el 3,4% de las conversaciones sin petición de red (7/208, IC Wilson 95% [1,6; 6,8]); con el wrapper en modo bloqueo, 0/72.
- Las salidas espontáneas del 3,4% son un defecto de consentimiento, no de transparencia: todas se anuncian, pero no se solicitan. La corrección `corr1` no las redujo.
- El test sellado de 330 casos se leyó cuatro veces, por lo que ha perdido el carácter ciego.
- Muestras pequeñas en casos sensibles (6) y provocadores (4), con intervalos de confianza amplios.
- La fusión de pesos y la cuantización GGUF para Ollama son posteriores a las pruebas y no se reevaluaron con el mismo protocolo.
- Durante las pruebas, el motivo de la alarma estaba en italiano también en los casos en inglés; el texto se corrigió después (`net_guard_code/alarm.py`) sin repetir los tests.
- El filtro de egreso independiente de modelo y wrapper (MUSERUOLA) está planteado pero no implementado ni probado.
- El checkpoint previo a la corrección (`step882`) no se publica.
- Idiomas limitados a italiano e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación y sesgos del modelo base no evaluados en esta información.
- Licencia Apache-2.0 permite uso comercial, pero el autor condiciona el uso responsable al despliegue tras `net_guard` o un filtro de egreso equivalente.

## Enlaces

- Hugging Face: https://huggingface.co/odelpa/qwen3.8-27b-trasparenza-rete-corr1-gdp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo (Zenodo, DOI): https://doi.org/10.5281/zenodo.24544746
- Trabajo previo Qwen3-14B v2 NT (Zenodo, DOI): https://doi.org/10.5281/zenodo.23950986
- Ollama (GGUF Q4_K_M): https://ollama.com/ollamagdp/qwen3.8-27b-trasparenza-rete-corr1-gdp
