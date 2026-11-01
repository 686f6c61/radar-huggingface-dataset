# oteam/ligandmpnn-noise020

## Resumen

LigandMPNN (variante noise020) es un modelo de diseño inverso de secuencias proteicas ("inverse folding") condicionado por la geometría del esqueleto proteico y por el contexto atómico no proteico: ligandos, ácidos nucleicos, metales y otras entidades químicas presentes en el entorno del sitio de unión. Lo desarrolla el equipo de David Baker (Dauparas et al.) y esta versión concreta es una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/ligandmpnn-noise020`. Resuelve el problema de asignar una secuencia de aminoácidos compatible con una estructura tridimensional dada, incorporando de forma explícita la química local de ligandos e iones, algo que los modelos clásicos de inverse folding (ProteinMPNN) no modelan.

Arquitectónicamente es una red neuronal de paso de mensajes (message-passing neural network) autorregresiva, con un tamaño muy reducido: 2.631.800 parámetros, hidden size de 128, 3 bloques de encoder, 2 bloques de contexto atómico, 2 bloques de contexto y 3 bloques de decoder. El checkpoint noise020 se distingue por haberse entrenado con un nivel de ruido de coordenadas de 0,20 Å, uno de los cuatro niveles publicados (0,05, 0,10, 0,20 y 0,30 Å).

Es relevante ahora porque el diseño computacional de proteínas con ligandos (enzimas, biosensores, proteínas de unión) exige modelos que razonen sobre interfaces proteína-ligando, y LigandMPNN se ha consolidado como referencia en ese nicho. La variante noise020 ofrece un punto intermedio de robustez frente a ruido estructural, útil cuando las estructuras de entrada provienen de predicciones (AlphaFold, Boltz) o de cristalografía con incertidumbre moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (message-passing) autorregresiva para diseño inverso de proteínas, con encoder, bloques de contexto atómico, bloques de contexto y decoder |
| Parametros totales | 2.631.800 (2,632 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; vecinos por nodo: 32; átomos de contexto: 25 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Hidden size | 128 |
| Bloques de encoder | 3 |
| Bloques de contexto atómico | 2 |
| Bloques de contexto | 2 |
| Bloques de decoder | 3 |
| Ruido de coordenadas de entrenamiento | 0,20 Å |
| Librería | ofoldx |
| Pipeline | other (diseño y scoring de secuencias) |

## Arquitectura y entrenamiento

LigandMPNN es una red de paso de mensajes sobre grafos de residuos y átomos. El encoder procesa el esqueleto proteico; los bloques de contexto atómico incorporan los átomos no proteicos cercanos (ligandos, metales, ácidos nucleicos), y los bloques de contexto y decoder generan la secuencia de forma autorregresiva, es decir, prediciendo residuos condicionados en las predicciones previas. Con 32 vecinos por nodo y 25 átomos de contexto, el modelo captura el entorno químico local del sitio de unión sin necesidad de una representación global de gran escala, lo que explica su reducido tamaño (2,6 M de parámetros).

El entrenamiento se basa en recuperación de secuencia a partir de la geometría del esqueleto y el contexto atómico no proteico, con perturbaciones de coordenadas para aumentar la robustez. Los cuatro checkpoints publicados comparten arquitectura y solo difieren en el nivel de ruido aplicado durante el entrenamiento (0,05, 0,10, 0,20 y 0,30 Å); esta variante corresponde a 0,20 Å. OFoldX expone una ruta `forward` diferenciable con teacher forcing para entrenamiento y ajuste fino, aunque la curación del dataset y la orquestación completa del entrenamiento quedan fuera del alcance de la librería.

## Capacidades

- Diseño de secuencias proteicas condicionado por esqueleto y contexto atómico no proteico (ligandos, iones metálicos, ácidos nucleicos).
- Scoring de secuencias: calcula la log-verosimilitud negativa (NLL) global y por residuo en nats, útil para evaluar compatibilidad secuencia-estructura.
- Generación de múltiples candidatos de secuencia con puntuaciones nombradas por candidato.
- Decodificación autorregresiva con múltiples órdenes de decodificación configurables (`num_decoding_orders`) y semilla para reproducibilidad.
- Integración con un empaquetador de cadenas laterales (MPNN Packer) para generar coordenadas de side-chain tras el diseño.
- No soporta tool calling, agentes, visión ni procesamiento de lenguaje natural: es un modelo especializado en biología estructural.
- No dispone de capacidades multilingües ni de modo de razonamiento textual.

## Casos de uso

- Diseño de enzimas con cofactor: dado un esqueleto con un ligando o metal en el sitio activo, el modelo propone secuencias que acomodan la química del cofactor, gracias a los bloques de contexto atómico que embeben los 25 átomos vecinos.
- Rediseño de sitios de unión proteína-ligando: partiendo de una estructura cristalográfica de un complejo, se generan variantes de secuencia en la interfaz para explorar afinidad o especificidad.
- Diseño de proteínas de unión a moléculas pequeñas: el modelo condiciona la secuencia a la presencia del ligando, lo que permite generar candidatos de biosensores o proteínas transportadoras.
- Rediseño de interfaces proteína-ácido nucleico: al incorporar átomos de ácidos nucleicos como contexto, sirve para diseñar dominios de unión a ADN o ARN.
- Robustez frente a estructuras predichas: la variante noise020, entrenada con 0,20 Å de ruido, es adecuada cuando la estructura de entrada proviene de predicciones (AlphaFold, Boltz) o de mapas de densidad con incertidumbre moderada.
- Filtrado y priorización en pipelines de diseño: el modo scoring con NLL por residuo permite descartar candidatos incompatibles antes de síntesis o validación experimental.
- Ajuste fino sobre datasets propios: la ruta `forward` diferenciable con teacher forcing de OFoldX permite reentrenar el modelo con datos internos de complejos proteína-ligando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 2,6 M de parámetros del modelo; el consumo real vendrá dominado por la representación del grafo de la estructura de entrada (vecinos y átomos de contexto), no por los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para estructuras grandes o lotes amplios conviene 16 GB o más.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660 en adelante), e incluso es viable en CPU para estructuras individuales.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) con sus pipelines `design` y `score`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto atómico no proteico | Licencia | Disponibilidad |
|---|---|---|---|---|
| LigandMPNN noise020 (este) | 2,632 M | Sí (ligandos, metales, ácidos nucleicos) | AGPL-3.0 | HuggingFace (oteam), implementación no oficial |
| ProteinMPNN | No disponible en la información | No (solo esqueleto proteico) | No disponible en la información | Repositorio oficial de los autores |
| LigandMPNN noise010 (oteam/ligandmpnn) | 2,632 M | Sí | AGPL-3.0 | HuggingFace (oteam) |
| LigandMPNN noise005 / noise030 | 2,632 M | Sí | AGPL-3.0 | HuggingFace (oteam) |

Las variantes de la familia comparten arquitectura y número de parámetros; la diferencia es el nivel de ruido de entrenamiento (0,05, 0,10, 0,20 y 0,30 Å), que afecta a la robustez frente a imprecisión estructural de la entrada. No se dispone de datos comparativos de rendimiento entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card la escribe el equipo OFoldX, no los autores originales de LigandMPNN; para resultados de referencia debe consultarse el repositorio oficial `dauparas/LigandMPNN`.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en productos comerciales o servicios en red puede exigir la liberación del código derivado. Revisar con asesoría legal antes de producción.
- Dependencia de la calidad estructural: el diseño depende de la precisión del esqueleto y de las coordenadas de los átomos de contexto; estructuras mal resueltas o ligandos mal posicionados degradan la calidad de las secuencias.
- Riesgo de secuencias no plegables o no funcionales: como todo modelo de inverse folding, genera candidatos computacionales que requieren validación experimental (expresión, estabilidad, unión).
- Sin datos de sesgo documentados, pero el entrenamiento sobre PDB puede heredar los sesgos de composición y cobertura de ese repositorio (sobrerrepresentación de ciertas familias proteicas).
- Sin benchmarks publicados en la información disponible: no es posible comparar cuantitativamente su rendimiento frente a alternativas.
- No apto para tareas de lenguaje, visión ni agentes; su uso está restringido al dominio de biología estructural.
- Solo 3 descargas y 0 likes en HuggingFace en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/ligandmpnn-noise020
- Variante noise005: https://huggingface.co/oteam/ligandmpnn-noise005
- Variante noise010: https://huggingface.co/oteam/ligandmpnn-noise010
- Variante noise010 (alias): https://huggingface.co/oteam/ligandmpnn
- Variante noise030: https://huggingface.co/oteam/ligandmpnn-noise030
- Paper: https://doi.org/10.1038/s41592-025-02626-1
- Repositorio oficial de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/ligandmpnn
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Documentación de OFoldX: https://ofoldx.valtech.ai/
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues
