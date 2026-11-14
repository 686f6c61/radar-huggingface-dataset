# kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors

## Resumen

`kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors` es una colección de vectores de control (control vectors) para escritura creativa, publicados como adaptador sobre el modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: son direcciones de activación que, aplicadas durante la inferencia, desplazan el comportamiento del modelo en ejes de personalidad y estilo sin modificar sus pesos. El autor es `kabachuha`, y el artefacto se distribuye bajo licencia CC-BY-4.0.

La propuesta es relevante para quienes trabajan en interpretabilidad mecanicista y en control fino de la generación: en lugar de reentrenar o recurrir a prompting, se inyectan vectores sobre las activaciones internas para modular tono narrativo, foco en personajes y registro lingüístico. Los ejes publicados son optimismo frente a nihilismo, compasión frente a sadismo, empatía frente a sociopatía, honestidad frente a maquiavelismo, humildad frente a narcisismo y un eje de lenguaje simple frente a ornamentado.

El repositorio es muy ligero (0,0 GB) y declara 194.560 parámetros en safetensors, coherente con un conjunto de vectores y no con un modelo completo. La generación se realiza con el modelo base; estos vectores solo se aplican a través de Project Maya (fork del autor o mainline) o, en teoría, de llama.cpp y backends específicos para DSV4.1, aunque el autor indica que estas dos últimas rutas no están probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de control (steering vectors) sobre las activaciones de un transformer; no es una arquitectura propia |
| Parametros totales | 194.560 (según safetensors del repo; corresponde a los vectores, no al modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para los vectores; el ejemplo de configuración del autor usa `--max-context 1048576` en el modelo base |
| Tipos de cuantizacion | GGUF para los vectores; el modelo base se usa en GGUF (ruta de ejemplo `DeepSeek-V4.1-Flash-1017-GGUF`) |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Los vectores se construyen a partir de tripletes de muestras que contrastan un polo positivo y uno negativo de cada rasgo, y se calibran contra una versión "debiased" del modelo base. El autor indica que empleó varios cientos de tripletes en lugar de los ~4000 recomendados, por lo que los vectores pueden presentar algo de ruido. El eje de nihilismo se publica en dos variantes: 128 tripletes (sufijo "fuzzy", algo ruidosa pero funcional) y 512 tripletes (sin sufijo, refinada y recomendada, aunque con posiblemente menos grados de libertad). El resto de vectores se construyen con 256 tripletes.

El uso requiere aplicar siempre el vector de debias con peso 1.0 junto con el vector del polo positivo o negativo correspondiente; los vectores no funcionan por separado y, si se aplican ambos polos del mismo eje a la vez, se anulan entre sí. La integración se realiza mediante `--control-vector-scaled` en Project Maya, con la sintaxis `ruta/debias.gguf:1.0,ruta/polo.gguf:<peso>`. En Project Maya el argumento debe ir en el fichero de configuración `.json` y no en `setup.sh`/`maya.sh`, ya que estos scripts sobrescriben la configuración. El autor recomienda copiar la configuración a un fichero propio (por ejemplo `maya-ds4-ablate-cv.json`) para evitar pérdidas por actualizaciones.

## Capacidades

- Modulación de tono narrativo en ejes de optimismo/nihilismo, compasión/sadismo, empatía/sociopatía, honestidad/maquiavelismo y humildad/narcisismo.
- Alteración del registro lingüístico entre lenguaje simple y ornamentado.
- Aplicación de los conceptos más allá de la escritura: el autor muestra que también afectan a la generación de SVG y a la elección de temática visual (ejemplo de un gato generado en baseline, con nihilismo +1.5 y con optimismo +1.5).
- Escritura creativa y roleplay con control de personalidad del personaje sin reentrenamiento.
- Compatibilidad declarada con Project Maya (fork del autor y mainline vía `--control-vector-scaled`) y compatibilidad teórica, no probada, con llama.cpp vanilla y backends dedicados a DSV4.1.
- Interpretabilidad mecanicista: los vectores sirven como herramienta de análisis de direcciones de activación asociadas a rasgos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias de estos vectores; dependen del modelo base.

## Casos de uso

- Escritura creativa con control de tono: aplicar el eje optimismo/nihilismo con pesos como 1.5 permite generar relatos con un tono marcadamente positivo o pesimista sin cambiar el prompt, útil para generar variantes de un mismo texto y comparar registros.
- Roleplay y personajes consistentes: los ejes de humildad/narcisismo y honestidad/maquiavelismo permiten fijar la personalidad de un personaje (por ejemplo, un antagonista maquiavélico) y mantenerla a lo largo de una conversación multi-turno.
- Generación de ficción oscura o de terror: el vector de nihilismo, con la advertencia del autor sobre contenido NSFL, sirve para producir narrativa de tono sombrío de forma controlada y reproducible.
- Adaptación de registro para distintos públicos: el eje lenguaje simple/ornamentado permite generar la misma historia en estilo llano o barroco, útil para materiales dirigidos a lectores de distinta edad o para localización estilística.
- Investigación en interpretabilidad: los vectores permiten experimentos de activación controlada para estudiar cómo se representan rasgos de personalidad y estilo en el espacio de activaciones del modelo base.
- Generación de interfaces y SVG con sesgo temático: el ejemplo del autor muestra que los vectores afectan también a la generación de código SVG, por lo que pueden usarse para explorar cómo el tono del modelo se filtra en tareas de diseño generativo.
- Prototipado de asistentes conversacionales con personalidad configurable: combinando varios ejes con pesos distintos se puede ajustar el comportamiento del asistente sin reentrenar, aunque con la cautela de que el modelo base ya es muy negativo y antisicofántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta ejemplos cualitativos (SVG de un gato y un relato corto en baseline frente a variantes con vectores), sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los vectores (el repo ocupa 0,0 GB); el consumo real lo determina el modelo base DeepSeek-V4.1-Flash-1017 en GGUF, cuyo tamaño y cuantización no se detallan en la información disponible.
- GPU recomendadas: no disponible. El ejemplo de configuración del autor usa `--tp 2`, lo que implica despliegue con tensor parallelism en al menos dos GPU, sin especificar modelo.
- ¿Cabe en GPU consumer?: no disponible; depende del modelo base y de la cuantización elegida, no de los vectores.
- Opciones de despliegue: Project Maya (fork `cvector-creator-ds4` del autor o mainline con `--control-vector-scaled`); compatibilidad teórica con llama.cpp vanilla y backends dedicados a DSV4.1, no probada.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors | Vectores de control sobre DSV4.1 | 194.560 (vectores) | no disponible (base: 1.048.576 en el ejemplo) | cc-by-4.0 | Hugging Face, 0 descargas, 1 like |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | Modelo base | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Project Maya (mw00) | Framework de inferencia con soporte de control vectors | no aplica | no disponible | no disponible | GitHub |

No se dispone de información sobre otros conjuntos de control vectors comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los vectores se construyeron con varios cientos de tripletes en lugar de los ~4000 recomendados, por lo que pueden ser algo ruidosos; el autor los considera utilizables.
- El vector de debias debe aplicarse siempre con peso 1.0 junto al polo positivo o negativo; no funcionan de forma aislada y los polos opuestos del mismo eje se anulan.
- El modelo base DeepSeek-V4.1 es descrito por el autor como muy negativo y antisicofántico; amplificar rasgos no positivos (nihilismo, sadismo, etc.) puede producir contenido NSFL explícito. El propio autor advierte de ello.
- Idiomas: solo se declara inglés (`en`); no hay evidencia de comportamiento correcto en castellano.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base, cuya licencia no se detalla en la información disponible.
- Compatibilidad limitada: probado en el fork de Project Maya del autor; el soporte en llama.cpp vanilla y backends DSV4.1 es teórico y no verificado.
- En Project Maya, pasar `--control-vector-scaled` en `setup.sh`/`maya.sh` sobrescribe la configuración; hay que editar el `.json` y no relanzar esos scripts.
- El repositorio tiene 0 descargas y 1 like, por lo que no hay validación comunitaria ni reportes de uso en producción.
- No hay benchmarks publicados que cuantifiquen la fidelidad o estabilidad de los ejes de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Fork de Project Maya del autor: https://github.com/kabachuha/project-maya/tree/cvector-creator-ds4
- Project Maya (original, mw00): no disponible en la información proporcionada
