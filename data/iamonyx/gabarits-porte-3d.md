# iamonyx/gabarits-porte-3d

## Resumen

`iamonyx/gabarits-porte-3d` no es un modelo de IA generativa, sino un repositorio de herramientas de validacion para modelos 3D. Lo publica el usuario `iamonyx` como parte de la cadena de produccion de un personaje virtual llamado Onyx (una peluche naranja de Montreal) y contiene los gabaritos de medida, los scripts de test de armadura y la especificacion de vistas de referencia que debe cumplir cualquier modelo 3D candidato antes de ser aceptado.

El problema que resuelve es concreto: un modelo 3D generado que "parece correcto" al ojo humano no es suficiente. El repositorio define una "puerta" de validacion estricta con umbrales escritos de antemano (proporciones con desviacion maxima del 3 %, rasgos con desviacion maxima del 2 %, colores conformes a la carta) que se aplican de forma automatizada mediante un script de Blender en modo headless. El primer borrador medido fallo en el ancho de las piernas (-13 %) y en el color (ΔE 13,5), algo que la inspeccion visual no habia cuantificado.

Es relevante para desarrolladores que construyan pipelines de generacion o validacion de assets 3D, porque ofrece un ejemplo funcional de como convertir criterios artisticos subjetivos en tests automatizados reproducibles. No contiene pesos, no es un modelo entrenado y no dispone de parametros, contexto ni arquitectura de red neuronal. La licencia del codigo y la documentacion es MIT, mientras que el personaje Onyx y sus modelos quedan fuera del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un conjunto de scripts de validacion para Blender) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr) |
| Licencia | MIT (codigo y documentacion); personaje Onyx y modelos excluidos |
| Formato de pesos | no disponible (no contiene pesos; scripts Python y documentacion Markdown) |

## Arquitectura y entrenamiento

El repositorio no contiene ningun modelo entrenado ni red neuronal. Se compone de scripts Python que se ejecutan sobre Blender en modo `--background` y de documentos de especificacion en Markdown. El componente principal es `mesurer_porte.py`, que mide un modelo candidato en formato `.glb` y calcula tres familias de metricas: proporciones normalizadas respecto a la altura total H (anchura de cabeza / H, distancia interocular / H, alturas de segmentos), desviaciones porcentuales respecto al modelo de referencia de la carta, y color medio de las zonas del pelaje comparado en ΔE contra la carta.

Los umbrales de la puerta estricta son: proporciones con desviacion menor o igual al 3 %, rasgos con desviacion menor o igual al 2 %, y colores conformes a la carta. El repositorio incluye ademas `test_armature.py` y `planches.py`, que generan un esqueleto con nombres normalizados (convencion VRM mas los huesos `onyx_ear.L/R`), aplican skinning, ejecutan poses de prueba y producen laminas de control. El veredicto documentado es que el skinning por "bone heat" falla de forma silenciosa en este tipo de malla; la alternativa adoptada es skinning por envolventes sobre una armadura reducida de 20 huesos, que dio 0 vertices sin peso. La especificacion `MODEL-SHEET-SPEC.md` define las vistas de referencia (frontal, perfil, espalda, tres cuartos; busto y cuerpo completo), los encuadres, las proporciones en unidades T (altura de cabeza) y las reglas de coherencia entre vistas.

## Capacidades

- Medicion automatizada de proporciones normalizadas de un modelo 3D candidato en formato `.glb`.
- Calculo de desviaciones porcentuales frente a un modelo de referencia de la carta del personaje.
- Comparacion de color por zonas del pelaje mediante distancia ΔE.
- Aplicacion de umbrales de aceptacion predefinidos (proporciones menor o igual al 3 %, rasgos menor o igual al 2 %, colores conformes).
- Generacion de esqueletos con nomenclatura normalizada VRM, incluidos huesos de oreja.
- Skinning por envolventes sobre armadura reducida de 20 huesos, con verificacion de vertices sin peso.
- Produccion de laminas de control a partir de poses de prueba.
- Ejecucion desatendida mediante `blender --background --python`.

## Casos de uso

- Validacion automatizada en pipelines de generacion 3D: integrar `mesurer_porte.py` como paso de control de calidad tras cada iteracion de un modelo generado, de modo que solo los candidatos que superen los umbrales (proporciones menor o igual al 3 %, rasgos menor o igual al 2 %, ΔE conforme) pasen a la siguiente etapa.
- Control de regresion entre versiones de un personaje: ejecutar el mismo gabarito sobre cada nueva version del modelo y comparar las metricas con las de la version anterior para detectar derivas no intencionadas en proporciones o color.
- Rigging previo a la animacion: usar `test_armature.py` para comprobar sobre un borrador desechable que el esqueleto con nomenclatura VRM se aplica correctamente y que no quedan vertices sin peso antes de comprometer el modelo definitivo a un esqueleto.
- Estandarizacion de assets para videojuegos o tiempo real: emplear `MODEL-SHEET-SPEC.md` como contrato de vistas de referencia y proporciones en unidades T para que todos los modelos del personaje sean coherentes entre si.
- Documentacion de criterios artisticos: convertir la carta de estilo del personaje en umbrales medibles y reproducibles, de forma que el equipo pueda auditar por que un candidato fue rechazado con numeros concretos en lugar de juicios subjetivos.
- Formacion de equipos tecnicos: el repositorio sirve como ejemplo didactico de como disenar una "puerta de validacion" para geometria 3D analoga a las puertas de fidelidad usadas en generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento consignado es el resultado de la primera medicion documentada: el borrador inicial fallo en la anchura de las piernas (-13 %) y en el color (ΔE 13,5), y el skinning por "bone heat" fallo de forma silenciosa, mientras que el skinning por envolventes sobre 20 huesos produjo 0 vertices sin peso.

## Requisitos de hardware

- No requiere GPU: los scripts se ejecutan sobre Blender en modo `--background`, por lo que el requisito real es una instalacion de Blender compatible con la version de la API de Python usada por los scripts.
- No aplica VRAM para inferencia de un modelo de IA, ya que el repositorio no contiene pesos ni red neuronal.
- El coste computacional depende del tamano de la malla `.glb` procesada y del numero de poses de prueba generadas en las laminas de control.
- No se especifican latencias ni throughput en la informacion disponible.
- Despliegue: ejecucion local mediante linea de comandos de Blender; no aplican opciones como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos o herramientas comparables de la misma categoria (gabaritos de validacion de modelos 3D para Blender).

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo, imagenes ni geometria; solo mide y valida modelos 3D existentes.
- No incluye el personaje Onyx, sus vistas de referencia ni los modelos 3D: estos quedan fuera del repositorio y son propiedad del atelier, por lo que el codigo no es directamente reutilizable sin aportar un modelo de referencia y una carta de estilo propios.
- Los umbrales (3 % en proporciones, 2 % en rasgos, conformidad de color en ΔE) estan calibrados para este personaje concreto; su validez para otros assets no esta documentada.
- El skinning por "bone heat" falla de forma silenciosa en este tipo de malla segun el veredicto consignado, lo que exige verificar explicitamente los vertices sin peso en cualquier pipeline de rigging.
- La documentacion esta en frances; no se declaran otros idiomas.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado, por lo que no hay evidencia de uso o mantenimiento por parte de terceros.
- La licencia MIT cubre codigo y documentacion, pero no el personaje ni sus modelos, lo que limita el uso comercial a las herramientas, no a los assets.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/gabarits-porte-3d
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
