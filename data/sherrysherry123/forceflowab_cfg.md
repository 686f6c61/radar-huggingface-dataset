# SherrySherry123/ForceFlowAb_CFG

## Resumen

ForceFlowAb es un framework generativo para el diseño de secuencias y estructuras de anticuerpos y nanobodies, desarrollado por el grupo iobio-zjut y publicado en HuggingFace por el usuario SherrySherry123. El repositorio en HuggingFace contiene la variante `ForceFlowAb_CFG`, que incorpora guiado por energía (energy-guided sampling) sobre un modelo de flujo rectificado (rectified flow). El sistema integra además un modelado con mezcla de expertos (Mixture-of-Experts, MoE), lo que lo hace especialmente relevante para tareas de diseño de proteínas donde se necesita explorar de forma eficiente el espacio de secuencias y conformaciones.

El modelo resuelve el problema del diseño racional de anticuerpos, una tarea clave en biotecnología y farmacología, al generar candidatos con estructura tridimensional coherente. El repositorio en HuggingFace tiene un tamaño de 0.6 GB, lo que sugiere un modelo de escala moderada, pero no se especifican el número total de parámetros ni la longitud de contexto. A pesar de la escasez de documentación técnica en la model card, la información disponible en el repositorio de GitHub y en la página del proyecto confirma su enfoque en diseño generativo de anticuerpos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujo rectificado (rectified flow) con mezcla de expertos (MoE) y muestreo guiado por energía |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

ForceFlowAb se basa en un framework de flujo rectificado (rectified flow) para el diseño conjunto de secuencia y estructura de anticuerpos. Esta arquitectura permite modelar la distribución de proteínas mediante un proceso de transporte probabilístico, en contraposición a los modelos autorregresivos tradicionales. El modelo integra un componente de mezcla de expertos (MoE) que activa subredes especializadas según la región de la secuencia o el tipo de residuo, lo que mejora la eficiencia computacional y la capacidad de representación. Además, incorpora muestreo guiado por energía (energy-guided sampling), que condiciona la generación mediante funciones de energía asociadas a propiedades físico-químicas o estructurales, permitiendo dirigir el diseño hacia objetivos específicos como afinidad o estabilidad.

No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La documentación disponible se limita a la descripción funcional del framework y a la página del proyecto, que destaca su capacidad para el diseño generativo de anticuerpos y nanobodies.

## Capacidades

- Diseño de secuencias de anticuerpos: el modelo genera secuencias de aminoácidos para cadenas pesadas y ligeras de anticuerpos, condicionadas a una estructura objetivo.
- Diseño de estructuras tridimensionales: además de la secuencia, produce conformaciones estructurales coherentes, lo que permite evaluar la viabilidad del candidato.
- Generación de nanobodies: está orientado específicamente al diseño de nanobodies, una clase de anticuerpos de dominio único con aplicaciones en diagnóstico y terapia.
- Muestreo guiado por energía: permite incorporar restricciones energéticas o propiedades físico-químicas durante la generación, facilitando el diseño de anticuerpos con afinidad o estabilidad optimizadas.
- Modelado con mezcla de expertos (MoE): activa subredes especializadas, lo que aumenta la capacidad del modelo sin disparar el coste computacional de forma lineal.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión ni capacidades multilingües.

## Casos de uso

- Descubrimiento de anticuerpos terapéuticos: el modelo puede generar candidatos de anticuerpos dirigidos a un antígeno concreto, partiendo de una estructura diana y usando el guiado energético para favorecer la unión.
- Diseño de nanobodies para diagnóstico: permite generar nanobodies estables y de pequeño tamaño para su uso en biosensores o kits de detección, aprovechando la generación conjunta de secuencia y estructura.
- Optimización de afinidad de anticuerpos existentes: mediante el muestreo guiado por energía, se pueden explorar variantes de una secuencia conocida para mejorar la afinidad sin alterar la estructura global.
- Humanización de anticuerpos murinos: el modelo puede proponer sustituciones en la región variable de un anticuerpo para reducir la inmunogenicidad, manteniendo la estructura de unión.
- Ingeniería de anticuerpos para inmunoterapia: se puede emplear para diseñar anticuerpos con regiones Fc modificadas o para generar formatos biespecíficos, si se condiciona adecuadamente la estructura.
- Exploración de espacios de secuencia en investigación básica: permite generar bibliotecas virtuales de anticuerpos para estudiar la relación entre secuencia, estructura y función, sin necesidad de experimentación física previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el repositorio tiene un tamaño de 0.6 GB, lo que sugiere que el modelo podría ejecutarse en GPU de consumo de gama alta, pero no se especifican requisitos de VRAM.
- Opciones de despliegue: no se han documentado integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El repositorio de HuggingFace no incluye resultados de benchmarks ni comparativas con otras herramientas de diseño de anticuerpos, por lo que no es posible establecer una comparación técnica con alternativas como IgDesign o DeepAb.

## Limitaciones y advertencias

- El repositorio en HuggingFace tiene 0 descargas y 0 likes, lo que indica que el modelo no ha sido validado por la comunidad y su rendimiento real es desconocido.
- No se han publicado resultados de benchmarks ni evaluaciones independientes, por lo que no se puede garantizar la calidad de las secuencias generadas.
- La model card no incluye información sobre sesgos, alucinaciones ni limitaciones de contexto, idioma o dominio.
- La licencia MIT permite el uso comercial, pero la ausencia de documentación sobre el proceso de entrenamiento y los datos utilizados supone un riesgo para su adopción en producción.
- El modelo está especializado exclusivamente en anticuerpos y nanobodies; no es aplicable a tareas de generación de lenguaje natural o código.
- Al ser un modelo generativo, existe riesgo de producir secuencias no viables o con plegamientos incorrectos, especialmente si no se dispone de un mecanismo de validación estructural posterior.

## Enlaces

- https://huggingface.co/SherrySherry123/ForceFlowAb_CFG
- https://github.com/iobio-zjut/ForceFlowAb
- http://zhanglab-bioinf.com/ForceFlowAb/
