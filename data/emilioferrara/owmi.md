# emilioferrara/owmi

## Resumen

OWMI (Open-Weight Masked Introspection) es un framework de medición para interpretabilidad y seguridad de modelos de lenguaje, desarrollado por Emilio Ferrara. Su objetivo es determinar si un modelo de lenguaje open-weight puede reportar de forma fiable una intervención controlada sobre su propia computación interna. El framework altera un objeto computacional concreto —un sitio del residual stream, un attention head o una feature de sparse autoencoder— y luego pide al modelo que informe del cambio. Como la intervención es impuesta y no inferida, la verdad de referencia se conoce con exactitud.

El framework incluye tres condiciones de control (sham, dirección aleatoria con impacto equivalente y observador solo-texto) que establecen qué debe superar una respuesta para ser significativa. En los resultados reportados, ningún modelo de los ocho evaluados discrimina una intervención real de un sham: el AUROC agrupado sobre 11.216 ensayos pareados es ≈0.5007, con un test de equivalencia que acota la ventaja de discriminación por debajo de 0,15 puntos porcentuales de AUROC (p < 0,0001). Sin embargo, una sonda lineal que lee las mismas activaciones recupera la intervención con una precisión del 95,8% y 75,0% en los dos modelos calibrados, lo que sugiere que la información está en las activaciones pero no en el relato verbal del modelo.

El preprint asociado (arXiv:2608.20569, 45 páginas) está bajo revisión. El repositorio es el artefacto de software que describe ese preprint e incluye operadores de intervención, banco de sondas, condiciones de control, estimadores de scoring y 17 configuraciones de ejecución. No redistribuye datos de benchmarks ni pesos de modelos: todo se carga desde sus fuentes originales en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (framework de medicion, no un modelo de pesos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende de los modelos evaluados) |
| Licencia | MIT |
| Formato de pesos | No aplica (codigo Python instalable con pip) |

## Arquitectura y entrenamiento

OWMI no es un modelo entrenado, sino un framework de evaluación compuesto por varios módulos: operadores de intervención sobre objetos computacionales internos, un banco de sondas con cinco familias, tres condiciones de control, estimadores de scoring pareados (probit d′ con corrección de borde finito, AUROC con empates, calibración, bootstrap agrupado por pares de ítems), un ancla de sonda lineal con controles de permutación de etiquetas y un procedimiento de test de equivalencia.

El framework se adjunta a benchmarks ya existentes en lugar de competir con ellos: suministra las intervenciones, las sondas y el scoring, pero no los prompts. Cada benchmark carga sus datos desde su fuente original en tiempo de ejecución. Los modelos evaluados se obtienen de sus propios repositorios. El estudio reportado cubre ocho modelos open-weight de siete familias de laboratorio, con más de 78.000 mediciones en total, incluyendo una batería de dosis (11.216 ensayos pareados) y una batería de amplitud (19.520 mediciones adicionales en tres modelos, cruzando tres clases de objeto computacional, seis profundidades de capa 8 a 31, cuatro dominios de benchmark, dos tracks temporales y cuatro familias de sondas).

## Capacidades

- Intervención controlada sobre sitios del residual stream, attention heads y features de sparse autoencoder en modelos open-weight.
- Tres condiciones de control que establecen la significancia estadística de los resultados: sham, dirección aleatoria con impacto equivalente y observador solo-texto.
- Banco de sondas con cinco familias de sondas para leer las activaciones.
- Estimadores de scoring pareados: probit d′ con corrección de borde finito, AUROC con empates, calibración y bootstrap agrupado por pares de ítems.
- Ancla de sonda lineal con controles de permutación de etiquetas (200 refits).
- Procedimiento de test de equivalencia para acotar la ventaja de discriminación.
- 17 configuraciones de ejecución y 18 módulos de test.
- Integración con benchmarks existentes sin redistribuir sus datos.

## Casos de uso

- Auditoría de interpretabilidad de modelos open-weight: OWMI permite verificar si un modelo puede reportar de forma fiable qué ocurre en su interior, algo que ningún otro framework establece porque no define la verdad de referencia. Un investigador puede ejecutar la batería de dosis sobre un modelo candidato y obtener un AUROC pareado que indique si el relato verbal del modelo contiene información real sobre su computación.
- Evaluación de seguridad de modelos antes de despliegue: el framework puede adjuntarse a benchmarks de seguridad existentes para comprobar si un modelo es capaz de detectar intervenciones internas que podrían indicar manipulación o comportamiento engañoso. El resultado de OWMI —que los modelos no discriminan intervención real de sham— es un dato relevante para equipos de red teaming.
- Investigación en mecanística (mechanistic interpretability): las intervenciones sobre residual stream, attention heads y features de SAE permiten estudiar qué componentes computacionales son funcionalmente relevantes para una tarea, y comparar la información disponible en activaciones frente a la que el modelo verbaliza.
- Desarrollo de métodos de oversight: el hallazgo de que una sonda lineal lee la intervención con alta precisión (95,8% y 75,0% en los modelos calibrados) mientras el modelo no la reporta, orienta el diseño de sistemas de supervisión que lean activaciones en lugar de depender de autoinformes.
- Validación de protocolos de evaluación: las tres condiciones de control (sham, impacto equivalente, solo-texto) son directamente reutilizables como plantillas para cualquier estudio que pretenda medir introspección o auto-reporte en LLMs.
- Reproducción de resultados científicos: el repositorio incluye 17 configuraciones de ejecución y 18 módulos de test, lo que permite reproducir el estudio completo (78.000+ mediciones) con los comandos documentados en la model card.

## Benchmarks y rendimiento

El framework no publica benchmarks de capacidades de lenguaje, sino resultados de medición de introspección. Los datos reportados en la model card son:

| Metrica | Valor |
|---|---|
| AUROC agrupado (batería de dosis, 11.216 ensayos pareados) | ≈0.5007 |
| Ventaja de discriminación acotada por test de equivalencia | < 0,15 puntos porcentuales de AUROC (p < 0,0001) |
| d′ de un modelo fine-tuneado para reportar la intervención | 5,15 (AUROC ≈ 1,0) |
| Precisión held-out de sonda lineal en modelos calibrados (dosis) | 95,8% y 75,0% (nivel de azar: 50%) |
| Precisión de sonda lineal re-cosechada downstream (capas 20 y 24) | Sin error held-out en ambos modelos calibrados |
| Precisión de sonda lineal en Mistral-7B-Instruct-v0.3 (capa 31) | Sin error held-out |
| Permutaciones label-shuffled que alcanzan el margen medido | 0 de 200 en todos los casos |
| Calibración de impacto en Qwen2.5-7B-Instruct | Jensen-Shannon 0,231 frente a objetivo 0,234 (dentro de 1,1%) |
| Calibración de impacto en Mistral-7B-Instruct-v0.3 | Jensen-Shannon 0,080 frente a objetivo 0,057 (sobrepasa en 41,2%) |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- No aplica directamente: OWMI es un framework de software, no un modelo con pesos propios.
- Para ejecutar las baterías completas se requiere hardware capaz de cargar los modelos evaluados (Qwen2.5-7B-Instruct, Mistral-7B-Instruct-v0.3, entre otros), por lo que se necesitan GPUs con al menos 16-24 GB de VRAM para los modelos de 7B en precisión completa o cuantización ligera.
- El repositorio no especifica GPUs concretas recomendadas; se asume hardware estándar de investigación (A100, H100, RTX 4090 o similar).
- El framework se instala con pip y se ejecuta mediante CLI (`python -m owmi.benchmarks.cli`), por lo que es compatible con entornos de investigación estándar.
- No se reportan datos de latencia ni throughput del framework.

## Comparativa con modelos similares

No existe un framework directamente comparable en el sentido de que OWMI establece la verdad de referencia mediante intervenciones impuestas. Alternativas parcialmente relacionadas en el espacio de interpretabilidad:

| Framework | Enfoque | Diferencia clave con OWMI |
|---|---|---|
| Activation patching (p.ej. ROME, patching de residual stream) | Interviene en activaciones para estudiar causalidad | No incluye condiciones de control sistemáticas ni mide el auto-reporte del modelo |
| Sparse autoencoders (p.ej. Anthropic, OpenAI) | Descomponen activaciones en features interpretables | No verifican si el modelo puede reportar la intervención sobre esas features |
| Causal tracing (p.ej. Meng et al.) | Localiza componentes causales mediante intervenciones | No compara la información en activaciones con el relato verbal del modelo |

OWMI es el único que combina intervención impuesta, tres condiciones de control y medición del auto-reporte del modelo, con un test de equivalencia estadístico.

## Limitaciones y advertencias

- El propio autor indica que la calibración de impacto no se logró en todos los modelos: solo Qwen2.5-7B-Instruct está calibrado dentro del 1,1% del objetivo; Mistral-7B-Instruct-v0.3 sobrepasa el objetivo en un 41,2%, y los seis modelos restantes usan una dirección aleatoria de norma unitaria que iguala el tamaño de la perturbación pero no su efecto. Los contrastes por modelo deben leerse con esta salvedad.
- Qwen3-14B fue ejecutado y excluido del roster reportado: solo 5 de sus 384 ensayos fueron puntuables y no produjo ningún par completo intervención-sham, por lo que no soporta ninguna estimación.
- El resultado principal (AUROC ≈0.5007) indica que los modelos evaluados no discriminan intervención real de sham en sus auto-reportes; esto no debe interpretarse como que los modelos son incapaces de introspección en general, sino que el protocolo de OWMI no detecta esa capacidad en estos modelos.
- El preprint está bajo revisión (arXiv:2608.20569) y una corrección posterior a la primera versión del repositorio cambia la lectura de un hallazgo concreto: en el modelo cuya confianza verbalizada predice si su propio reporte es correcto, el reporte de detección discreto es constante. La lectura corregida es la que debe citarse.
- El framework no redistribuye datos de benchmarks ni pesos de modelos; todo se carga desde fuentes originales en tiempo de ejecución, lo que requiere acceso a red y a los repositorios correspondientes.
- Licencia MIT permite uso comercial, pero los modelos evaluados tienen sus propias licencias que deben verificarse por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/emilioferrara/owmi
- Preprint arXiv: https://arxiv.org/abs/2608.20569
- Perfil del autor en HuggingFace: https://huggingface.co/emilioferrara
- Web del autor: https://emilioferrara.github.io/
- Índice de investigación del autor: https://emilioferrara.github.io/ai-research/
- GitHub del autor: https://github.com/emilioferrara/ai-research
