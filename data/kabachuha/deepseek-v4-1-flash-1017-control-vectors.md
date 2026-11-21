# kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors

## Resumen

DeepSeek-V4.1-Flash-1017-control-vectors es un conjunto de vectores de control (control vectors / steering vectors) para el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicado por el usuario kabachuha en Hugging Face. No se trata de un modelo generativo completo, sino de un adaptador de interpretabilidad mecanicista que permite modular la activación interna del modelo base para orientar su comportamiento estilístico y de personalidad sin reentrenamiento.

El repositorio contiene pares de vectores que definen ejes bipolares de comportamiento (optimismo frente a nihilismo, compasión frente a sadismo, empatía frente a sociopatía, honestidad frente a maquiavelismo, humildad frente a narcisismo, lenguaje simple frente a ornamentado y un eje experimental cálido frente a moralizante). Cada vector se aplica en inferencia ajustando activaciones en una dirección concreta, lo que permite sintonizar el tono narrativo, el foco en los personajes y elementos estilísticos en tareas de escritura creativa y roleplay.

El interés actual del repositorio reside en que ofrece una vía práctica de control conductual sobre un modelo de gran tamaño sin fine-tuning, con vectores calibrados contra el modelo desbiaseado y compatibles con el fork Project Maya de llama.cpp. El modelo base pertenece a la familia DeepSeek-V4.1-Flash-1017 y el adaptador declara licencia CC-BY-4.0 y soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador de vectores de control sobre transformer (modelo base DeepSeek-V4.1-Flash-1017); arquitectura exacta del base no disponible |
| Parametros totales | 194.560 (dato real de safetensors del adaptador); parametros del modelo base no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el adaptador; en la configuracion de ejemplo de Project Maya se usa `--max-context 1048576` sobre el base |
| Tipos de cuantizacion | vectores en formato GGUF (debias y ejes positivos/negativos); cuantizaciones del modelo base no disponibles |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (vectores de control); safetensors presente en el repo (194.560 parametros) |

## Arquitectura y entrenamiento

El adaptador no es un modelo entrenado de forma autonoma, sino un conjunto de vectores de direccion calculados a partir de tripletas de muestras sobre el modelo base DeepSeek-V4.1-Flash-1017. Segun la model card, los vectores se construyeron con varios cientos de tripletas en lugar de las ~4000 recomendadas, por lo que pueden presentar cierto ruido. El vector de nihilismo se publica en dos variantes: una de 128 muestras (sufijo "fuzzy", algo ruidosa pero funcional) y otra de 512 muestras (refinada y recomendada, con posiblemente menos grados de libertad); el resto de vectores se generaron con 256 tripletas.

Cada eje se compone de un vector de desviacion (debias) y dos direcciones opuestas (positiva y negativa). El debias debe aplicarse siempre con fuerza 1.0 junto al eje positivo o negativo correspondiente, ya que los vectores estan calibrados contra el modelo desbiaseado y no funcionan de forma aislada. La aplicacion simultanea de ambos extremos de un eje provoca cancelacion mutua. La implementacion de referencia es el fork `cvector-creator-ds4` del proyecto Project Maya de mw00, y se indica compatibilidad teorica con llama.cpp estandar y backends dedicados a DSV4.1, aunque no verificada.

## Capacidades

- Escritura creativa y narrativa: modulacion del tono (optimismo/nihilismo), del foco en personajes y de elementos estilisticos.
- Roleplay conversacional: ajuste de la personalidad del personaje mediante ejes de compasion, empatia, honestidad, humildad y narcisismo.
- Control de estilo linguistico: eje de lenguaje simple frente a ornamentado.
- Control experimental de tono conversacional: eje `warm_vs_moralizing`, con efectos en chat directo a fuerzas ~1.5-2.5 y efecto de mayor cordialidad en roleplay a 0.5.
- Generacion de artefactos visuales: los conceptos de los vectores se transfieren a dominios como generacion de SVG y temas de interfaz, segun los ejemplos de la model card.
- Interpretabilidad mecanicista: inspeccion y manipulacion de activaciones internas del modelo base.
- No incluye tool calling, function calling, agentes ni capacidades multimodales propias; estas dependen exclusivamente del modelo base.

## Casos de uso

- Roleplay con SillyTavern: aplicar el eje `warm_vs_moralizing` a fuerza 0.5 para que las partidas multturno resulten mas cordiales y menos cortantes, aprovechando que el vector actua sobre el tono sin reentrenar el modelo.
- Ficcion con tono controlado: usar los ejes de optimismo y nihilismo a fuerzas de 1.5 para generar relatos con registro emocional coherente y reproducible, como en el ejemplo de la model card sobre una nina que gana un premio.
- Generacion de personajes antagonistas: aplicar el eje `honesty_vs_machiavellianism` en direccion negativa para producir dialogos de villanos manipuladores con un grado de maquiavelismo calibrado.
- Escritura de prosa ornamentada: activar el eje de lenguaje simple frente a ornamentado para adaptar el registro de textos literarios o de marketing a un estilo mas recargado o mas directo.
- Generacion de SVG y temas de interfaz coherentes con una atmosfera: usar los ejes de optimismo o nihilismo para que los artefactos visuales generados (iconos, ilustraciones, paletas) acompanen el tono del producto.
- Investigacion en interpretabilidad: estudiar como rasgos de personalidad se representan como direcciones lineales en el espacio de activaciones de un modelo de gran tamano, y comparar variantes de 128, 256 y 512 tripletas.
- Auditoria de sesgos conductuales: medir la amplificacion de rasgos negativos al subir la fuerza del vector de nihilismo para documentar riesgos de contenido NSFL en despliegues de escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base DeepSeek-V4.1-Flash-1017 y de su cuantizacion, dato no disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; el ejemplo de configuracion de Project Maya usa `--tp 2`, lo que sugiere despliegue multi-GPU para el modelo base.
- Opciones de despliegue: fork Project Maya (`cvector-creator-ds4`), mainline Project Maya con `--control-vector-scaled`, y compatibilidad teorica con llama.cpp estandar y backends dedicados a DSV4.1 (no verificada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de vectores de control comparables.

## Limitaciones y advertencias

- Los vectores se construyeron con varios cientos de tripletas en lugar de las ~4000 recomendadas, por lo que pueden ser ruidosos; el vector de nihilismo de 128 muestras es explicitamente descrito como "fuzzy".
- El debias debe aplicarse siempre con fuerza 1.0 junto al eje positivo o negativo; usarlo de forma aislada no es valido.
- Aplicar simultaneamente los dos extremos de un eje provoca cancelacion mutua.
- DeepSeek-V4.1 ya es un modelo muy negativo y antisicofantico; subir el nihilismo u otros rasgos no positivos amplifica enormemente el efecto y puede producir contenido NSFL explicito, segun advierte el autor.
- El eje `warm_vs_moralizing` es experimental: a fuerzas de 2.5 rompe la coherencia y solo muestra efectos claros en chat directo.
- Compatibilidad con llama.cpp estandar y backends dedicados a DSV4.1 no verificada; solo Project Maya esta probado.
- En Project Maya, `--control-vector-scaled` no debe pasarse en `setup.sh/maya.sh` ni junto a el, sino en el fichero `.json` de configuracion; relanzar `setup.sh/maya.sh` sobrescribe la configuracion.
- Soporte unicamente en ingles.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base DeepSeek-V4.1-Flash-1017, cuya licencia no se detalla en la informacion disponible.
- Riesgo de alucinacion: no documentado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible, mas alla de la amplificacion de rasgos negativos descrita.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Fork de Project Maya para creacion de vectores: https://github.com/kabachuha/project-maya/tree/cvector-creator-ds4
- Project Maya (proyecto original de mw00): no disponible URL directa en la informacion proporcionada
